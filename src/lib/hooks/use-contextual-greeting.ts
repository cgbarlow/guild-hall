'use client'

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useUserTier } from './use-skill-tiers'
import { useUserStreak } from './use-user-streak'
import type { GreetingContext, GreetingPriority } from '@/lib/types/engagement'

// Session storage keys
const GREETING_CACHE_KEY = 'guild-hall-greeting'
const CELEBRATION_SHOWN_PREFIX = 'guild-hall-celebration-shown-'

interface CachedGreeting {
  greeting: string
  priority: GreetingPriority
  subMessage?: string
  timestamp: number
  date: string
  userId: string
}

/**
 * Check if celebration greeting was already shown this session for this user
 */
function wasCelebrationShown(userId: string): boolean {
  if (typeof window === 'undefined') return false
  return sessionStorage.getItem(`${CELEBRATION_SHOWN_PREFIX}${userId}`) === 'true'
}

/**
 * Mark celebration as shown for this session for this user
 */
function markCelebrationShown(userId: string): void {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(`${CELEBRATION_SHOWN_PREFIX}${userId}`, 'true')
}

/**
 * Get cached greeting from session storage
 * Returns null if cache is invalid, from a different day, for a different user,
 * or if the greeting is action-based (which can become stale quickly)
 */
function getCachedGreeting(userId: string | undefined): CachedGreeting | null {
  if (typeof window === 'undefined' || !userId) return null

  const cached = sessionStorage.getItem(GREETING_CACHE_KEY)
  if (!cached) return null

  try {
    const parsed = JSON.parse(cached) as CachedGreeting
    // Invalidate if from a different day
    const today = new Date().toISOString().split('T')[0]
    if (parsed.date !== today) return null
    // Invalidate if for a different user (prevents cross-user cache leakage)
    if (parsed.userId !== userId) return null
    // Don't cache action-priority greetings as they can become stale quickly
    // (e.g., "5 objectives ready" becomes wrong after completing objectives)
    if (parsed.priority === 'action') return null
    return parsed
  } catch {
    return null
  }
}

/**
 * Cache greeting in session storage
 */
function setCachedGreeting(greeting: string, priority: GreetingPriority, userId: string, subMessage?: string): void {
  if (typeof window === 'undefined') return

  const cached: CachedGreeting = {
    greeting,
    priority,
    subMessage,
    timestamp: Date.now(),
    date: new Date().toISOString().split('T')[0],
    userId,
  }

  sessionStorage.setItem(GREETING_CACHE_KEY, JSON.stringify(cached))
}

/**
 * Get time-based greeting based on hour
 */
function getTimeGreeting(hour: number, displayName: string): string {
  if (hour >= 5 && hour < 12) {
    return `Good morning, ${displayName}`
  } else if (hour >= 12 && hour < 17) {
    return `Good afternoon, ${displayName}`
  } else if (hour >= 17 && hour < 21) {
    return `Good evening, ${displayName}`
  } else {
    return `Burning the midnight oil, ${displayName}?`
  }
}

interface GreetingDataResult {
  recentlyCompletedQuests: Array<{ quest_id: string; quest_title: string; completed_at: string }>
  approvedObjectivesCount: number
  upcomingDeadlines: Array<{ quest_id: string; quest_title: string; days_remaining: number }>
}

/**
 * Fetch data needed for greeting calculation
 */
async function fetchGreetingData(userId: string): Promise<GreetingDataResult> {
  const supabase = createClient()
  const now = new Date()
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)

  // Fetch recently completed quests (last 24 hours)
  const { data: completedQuests } = await supabase
    .from('user_quests')
    .select('quest_id, completed_at, quests!inner(title)')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .gte('completed_at', oneDayAgo.toISOString())
    .order('completed_at', { ascending: false })
    .limit(3)

  // Fetch user's active quest IDs first
  const { data: activeQuests } = await supabase
    .from('user_quests')
    .select('id')
    .eq('user_id', userId)
    .in('status', ['accepted', 'in_progress'])

  const activeQuestIds = (activeQuests as Array<{ id: string }> | null)?.map(q => q.id) ?? []

  // Fetch count of approved objectives ready to continue
  let approvedCount = 0
  if (activeQuestIds.length > 0) {
    const { count } = await supabase
      .from('user_objectives')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved')
      .in('user_quest_id', activeQuestIds)
    approvedCount = count ?? 0
  }

  // Fetch upcoming deadlines (next 3 days)
  const { data: deadlines } = await supabase
    .from('user_quests')
    .select('quest_id, deadline, quests!inner(title)')
    .eq('user_id', userId)
    .in('status', ['accepted', 'in_progress'])
    .not('deadline', 'is', null)
    .lte('deadline', threeDaysFromNow.toISOString())
    .gte('deadline', now.toISOString())
    .order('deadline', { ascending: true })
    .limit(3)

  const recentlyCompletedQuests = (completedQuests || []).map((q: any) => ({
    quest_id: q.quest_id,
    quest_title: q.quests?.title || 'Unknown Quest',
    completed_at: q.completed_at,
  }))

  const upcomingDeadlines = (deadlines || []).map((d: any) => ({
    quest_id: d.quest_id,
    quest_title: d.quests?.title || 'Unknown Quest',
    days_remaining: Math.ceil((new Date(d.deadline).getTime() - now.getTime()) / (24 * 60 * 60 * 1000)),
  }))

  return {
    recentlyCompletedQuests,
    approvedObjectivesCount: approvedCount || 0,
    upcomingDeadlines,
  }
}

/**
 * Evaluate greeting based on priority
 */
function evaluateGreeting(
  data: GreetingDataResult,
  displayName: string,
  tierInfo: { pointsToNext: number; nextTier: { name: string } | null } | null,
  streakInfo: { currentStreak: number } | null,
  userId: string,
): GreetingContext {
  const hour = new Date().getHours()

  // Priority 1: Celebration - Quest completed recently (only show once per session per user)
  if (data.recentlyCompletedQuests.length > 0 && !wasCelebrationShown(userId)) {
    const quest = data.recentlyCompletedQuests[0]
    markCelebrationShown(userId)
    return {
      priority: 'celebration',
      message: `Congratulations on completing ${quest.quest_title}!`,
      icon: 'PartyPopper',
    }
  }

  // Priority 2: Action - Approved objectives ready
  if (data.approvedObjectivesCount > 0) {
    return {
      priority: 'action',
      message: `You have ${data.approvedObjectivesCount} objective${data.approvedObjectivesCount > 1 ? 's' : ''} ready to progress!`,
      subMessage: 'Check your active quests',
      icon: 'ArrowRight',
    }
  }

  // Priority 3: Action - Deadline approaching
  if (data.upcomingDeadlines.length > 0) {
    const deadline = data.upcomingDeadlines[0]
    return {
      priority: 'action',
      message: `"${deadline.quest_title}" is due in ${deadline.days_remaining} day${deadline.days_remaining > 1 ? 's' : ''}!`,
      icon: 'Clock',
    }
  }

  // Priority 4: Progression - Near tier milestone
  if (tierInfo && tierInfo.nextTier && tierInfo.pointsToNext <= 50) {
    return {
      priority: 'progression',
      message: `Just ${tierInfo.pointsToNext} points from ${tierInfo.nextTier.name}!`,
      icon: 'TrendingUp',
    }
  }

  // Priority 5: Progression - Streak milestone
  if (streakInfo && [7, 14, 30, 100].includes(streakInfo.currentStreak)) {
    return {
      priority: 'progression',
      message: `${streakInfo.currentStreak} day streak! Keep it going!`,
      icon: 'Flame',
    }
  }

  // Priority 6: Time-based fallback
  return {
    priority: 'time',
    message: getTimeGreeting(hour, displayName),
    icon: hour >= 18 || hour < 6 ? 'Moon' : 'Sun',
  }
}

/**
 * Hook to get contextual greeting for the user
 */
export function useContextualGreeting(
  userId: string | undefined,
  displayName: string,
  userPoints: number | undefined,
) {
  // Check for cached greeting first (validates userId to prevent cross-user cache leakage)
  const cached = typeof window !== 'undefined' ? getCachedGreeting(userId) : null

  // Fetch greeting data from database
  // Short staleTime ensures data is fresh when user returns to dashboard
  const { data: greetingData, isLoading: isLoadingData } = useQuery({
    queryKey: ['greeting-data', userId],
    queryFn: () => fetchGreetingData(userId!),
    enabled: !!userId && !cached,
    staleTime: 1000 * 30, // 30 seconds - keep fresh for quest state changes
    refetchOnWindowFocus: true, // Refetch when user returns to tab
  })

  // Get tier info
  const { tierInfo } = useUserTier(userPoints)

  // Get streak info
  const { data: streakInfo } = useUserStreak(userId)

  // Calculate greeting
  const greeting = useMemo(() => {
    // Return cached greeting if available
    if (cached) {
      return {
        priority: cached.priority,
        message: cached.greeting,
        subMessage: cached.subMessage,
      } as GreetingContext
    }

    // If data not loaded yet or no userId, return time-based greeting
    if (!greetingData || !userId) {
      return {
        priority: 'time' as GreetingPriority,
        message: getTimeGreeting(new Date().getHours(), displayName),
        icon: 'Sun',
      }
    }

    const result = evaluateGreeting(
      greetingData,
      displayName,
      tierInfo,
      streakInfo || null,
      userId,
    )

    // Cache the result (include userId to prevent cross-user cache leakage)
    if (userId) {
      setCachedGreeting(result.message, result.priority, userId, result.subMessage)
    }

    return result
  }, [cached, greetingData, displayName, tierInfo, streakInfo, userId])

  return {
    greeting,
    isLoading: !cached && isLoadingData,
  }
}
