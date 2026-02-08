'use client'

import { useState, useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { NudgeBannerData, NudgePriority } from '@/lib/types/engagement'

/**
 * Check if user can accept a quest (all prerequisites completed)
 */
async function canAcceptQuest(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  questId: string
): Promise<boolean> {
  try {
    const { data, error } = await (supabase.rpc as CallableFunction)(
      'can_accept_quest',
      { p_user_id: userId, p_quest_id: questId }
    )

    if (error) {
      // Function might not exist, assume can accept
      return true
    }

    return data as boolean
  } catch {
    return true // Assume can accept if function doesn't exist
  }
}

// Session storage key for dismissed nudges
const NUDGE_DISMISSED_KEY = 'guild-hall-nudge-dismissed'

interface NudgeContext {
  approvedObjectivesCount: number
  upcomingDeadlines: Array<{ quest_id: string; quest_title: string; days_remaining: number }>
  activeQuestsCount: number
  recommendedQuest: { id: string; title: string } | null
  recentMilestone: { type: 'tier' | 'quest' | 'streak'; message: string } | null
  badgesReadyToClaim: Array<{ user_quest_id: string; quest_title: string; badge_url: string }>
}

/**
 * Check if nudge was dismissed this session
 */
function isNudgeDismissed(priority: NudgePriority): boolean {
  if (typeof window === 'undefined') return false

  const dismissed = sessionStorage.getItem(NUDGE_DISMISSED_KEY)
  if (!dismissed) return false

  try {
    const dismissedList = JSON.parse(dismissed) as string[]
    return dismissedList.includes(priority)
  } catch {
    return false
  }
}

/**
 * Mark nudge as dismissed for this session
 */
function dismissNudge(priority: NudgePriority): void {
  if (typeof window === 'undefined') return

  const dismissed = sessionStorage.getItem(NUDGE_DISMISSED_KEY)
  let dismissedList: string[] = []

  try {
    dismissedList = dismissed ? JSON.parse(dismissed) : []
  } catch {
    dismissedList = []
  }

  if (!dismissedList.includes(priority)) {
    dismissedList.push(priority)
  }

  sessionStorage.setItem(NUDGE_DISMISSED_KEY, JSON.stringify(dismissedList))
}

/**
 * Get recommended action based on context (shared logic for email too)
 * This function is exported for reuse in the weekly email Edge Function
 */
export function getRecommendedAction(context: NudgeContext): NudgeBannerData | null {
  // Priority 1: Approved submissions ready to progress
  if (context.approvedObjectivesCount > 0) {
    return {
      priority: 'approved_ready',
      message: `You have ${context.approvedObjectivesCount} objective${context.approvedObjectivesCount > 1 ? 's' : ''} approved and ready to continue!`,
      actionUrl: '/my-quests',
      actionLabel: 'Continue Quest',
      variant: 'info',
    }
  }

  // Priority 2: Badge ready to claim (quest completed with badge)
  if (context.badgesReadyToClaim && context.badgesReadyToClaim.length > 0) {
    const badge = context.badgesReadyToClaim[0]
    return {
      priority: 'badge_ready_to_claim',
      message: `You've earned a badge for "${badge.quest_title}"! Claim your reward.`,
      actionUrl: `/my-quests/${badge.user_quest_id}`,
      actionLabel: 'Claim Badge',
      variant: 'celebration',
    }
  }

  // Priority 3: Approaching deadline (< 3 days)
  const urgentDeadline = context.upcomingDeadlines.find(d => d.days_remaining <= 3)
  if (urgentDeadline) {
    return {
      priority: 'deadline_soon',
      message: `"${urgentDeadline.quest_title}" is due in ${urgentDeadline.days_remaining} day${urgentDeadline.days_remaining > 1 ? 's' : ''}!`,
      actionUrl: `/quests/${urgentDeadline.quest_id}`,
      actionLabel: 'View Quest',
      variant: 'warning',
    }
  }

  // Priority 3: Recent celebration milestone
  if (context.recentMilestone) {
    return {
      priority: 'celebration',
      message: context.recentMilestone.message,
      actionUrl: '/profile',
      actionLabel: 'View Progress',
      variant: 'celebration',
    }
  }

  // Priority 4: Quest recommendation (if no active quests)
  if (context.activeQuestsCount === 0 && context.recommendedQuest) {
    return {
      priority: 'quest_recommendation',
      message: `Ready for a new challenge? "${context.recommendedQuest.title}" might be perfect for you.`,
      actionUrl: `/quests/${context.recommendedQuest.id}`,
      actionLabel: 'View Quest',
      variant: 'info',
    }
  }

  return null
}

/**
 * Fetch nudge context from database
 */
async function fetchNudgeContext(userId: string): Promise<NudgeContext> {
  const supabase = createClient()
  const now = new Date()
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)

  // Fetch user's active quest IDs first
  const { data: activeQuestsData } = await supabase
    .from('user_quests')
    .select('id')
    .eq('user_id', userId)
    .in('status', ['accepted', 'in_progress'])

  const activeQuestIds = (activeQuestsData as Array<{ id: string }> | null)?.map(q => q.id) ?? []

  // Fetch approved objectives count
  let approvedCount = 0
  if (activeQuestIds.length > 0) {
    const { count } = await supabase
      .from('user_objectives')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved')
      .in('user_quest_id', activeQuestIds)
    approvedCount = count ?? 0
  }

  // Fetch quests ready to claim that have badges
  const { data: badgeQuestsData } = await supabase
    .from('user_quests')
    .select('id, quests!inner(title, badge_url)')
    .eq('user_id', userId)
    .eq('status', 'ready_to_claim')
    .not('quests.badge_url', 'is', null)
    .limit(5)

  const badgesReadyToClaim = (badgeQuestsData || [])
    .filter((q: any) => q.quests?.badge_url)
    .map((q: any) => ({
      user_quest_id: q.id,
      quest_title: q.quests?.title || 'Unknown Quest',
      badge_url: q.quests?.badge_url,
    }))

  // Fetch upcoming deadlines
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

  // Fetch active quests count
  const { count: activeCount } = await supabase
    .from('user_quests')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .in('status', ['accepted', 'in_progress'])

  // Fetch user's accepted quest IDs to exclude
  const { data: userQuestsData } = await supabase
    .from('user_quests')
    .select('quest_id')
    .eq('user_id', userId)

  const userQuestIds = (userQuestsData as Array<{ quest_id: string }> | null)?.map(q => q.quest_id) ?? []

  // Fetch recommended quest (featured quest user hasn't accepted AND can accept)
  let featuredQuestsQuery = supabase
    .from('quests')
    .select('id, title')
    .eq('status', 'published')
    .eq('featured', true)

  if (userQuestIds.length > 0) {
    featuredQuestsQuery = featuredQuestsQuery.not('id', 'in', `(${userQuestIds.map(id => `'${id}'`).join(',')})`)
  }

  // Fetch multiple featured quests to check prerequisites
  const { data: featuredQuestsData } = await featuredQuestsQuery.limit(5)
  const featuredQuests = featuredQuestsData as Array<{ id: string; title: string }> | null

  const upcomingDeadlines = (deadlines || []).map((d: any) => ({
    quest_id: d.quest_id,
    quest_title: d.quests?.title || 'Unknown Quest',
    days_remaining: Math.ceil((new Date(d.deadline).getTime() - now.getTime()) / (24 * 60 * 60 * 1000)),
  }))

  // Find first featured quest user can actually accept (prerequisites met)
  let recommendedQuest: { id: string; title: string } | null = null
  if (featuredQuests && featuredQuests.length > 0) {
    for (const quest of featuredQuests) {
      const canAccept = await canAcceptQuest(supabase, userId, quest.id)
      if (canAccept) {
        recommendedQuest = { id: quest.id, title: quest.title }
        break
      }
    }
  }

  return {
    approvedObjectivesCount: approvedCount || 0,
    upcomingDeadlines,
    activeQuestsCount: activeCount || 0,
    recommendedQuest,
    recentMilestone: null, // Could be extended to check recent achievements
    badgesReadyToClaim,
  }
}

/**
 * Hook to get the current nudge banner (if any)
 * @param userId - The user's ID
 * @param enableNudges - Whether nudges are enabled (default: true)
 * @param skipPriorities - Array of nudge priorities to skip (to avoid duplication with other components)
 */
export function useNudgeBanner(
  userId: string | undefined,
  enableNudges: boolean = true,
  skipPriorities: NudgePriority[] = []
) {
  const [dismissed, setDismissed] = useState<NudgePriority[]>([])

  // Load dismissed state on mount
  useEffect(() => {
    if (typeof window === 'undefined') return

    const dismissedStr = sessionStorage.getItem(NUDGE_DISMISSED_KEY)
    if (dismissedStr) {
      try {
        setDismissed(JSON.parse(dismissedStr))
      } catch {
        setDismissed([])
      }
    }
  }, [])

  // Fetch nudge context
  const { data: context, isLoading } = useQuery({
    queryKey: ['nudge-context', userId],
    queryFn: () => fetchNudgeContext(userId!),
    enabled: !!userId && enableNudges,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Calculate current nudge
  const nudge = useMemo(() => {
    if (!context || !enableNudges) return null

    const recommended = getRecommendedAction(context)
    if (!recommended) return null

    // Check if this nudge was dismissed
    if (dismissed.includes(recommended.priority)) return null

    // Skip priorities that are handled by other components (e.g., ContextualGreeting, YourPathSection)
    if (skipPriorities.includes(recommended.priority)) return null

    return recommended
  }, [context, enableNudges, dismissed, skipPriorities])

  // Dismiss handler
  const handleDismiss = () => {
    if (!nudge) return

    dismissNudge(nudge.priority)
    setDismissed(prev => [...prev, nudge.priority])
  }

  return {
    nudge,
    isLoading,
    dismiss: handleDismiss,
  }
}
