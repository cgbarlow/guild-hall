'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { QuestRecommendation } from '@/lib/types/engagement'
import { DIFFICULTY_ORDER, type QuestDifficulty } from '@/lib/types/quest'

interface RecommendationResult {
  recommendation: QuestRecommendation | null
  isLoading: boolean
  error: unknown
}

// Map tier names to difficulty levels for filtering
const TIER_TO_MAX_DIFFICULTY: Record<string, number> = {
  'Apprentice': 1,  // Can do Apprentice quests
  'Journeyman': 2,  // Can do Apprentice + Journeyman
  'Expert': 3,      // Can do up to Expert
  'Master': 4,      // Can do up to Master
  'Legend': 4,      // Can do all quests
}

/**
 * Check if quest difficulty is appropriate for user's tier
 */
function isQuestAppropriateForTier(questDifficulty: QuestDifficulty | null, userTierName: string): boolean {
  if (!questDifficulty) return true // No difficulty set = open to all
  const maxDifficulty = TIER_TO_MAX_DIFFICULTY[userTierName] ?? 1
  const questLevel = DIFFICULTY_ORDER[questDifficulty] ?? 1
  return questLevel <= maxDifficulty
}

/**
 * Check if user can accept a quest (all prerequisites completed)
 */
async function canAcceptQuest(supabase: ReturnType<typeof createClient>, userId: string, questId: string): Promise<boolean> {
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

/**
 * Fetch quest recommendation for a user
 * Prioritizes:
 * 1. Featured quests user hasn't started (and can accept)
 * 2. Quests in categories user has completed before (familiarity)
 * 3. Most popular quests by acceptance rate
 *
 * Excludes quests that are locked by prerequisites
 * Filters by user's tier - only recommends quests at or below their level
 */
async function fetchQuestRecommendation(userId: string): Promise<QuestRecommendation | null> {
  const supabase = createClient()

  // Get user's current tier from their points
  const { data: userData } = await supabase
    .from('users')
    .select('total_points')
    .eq('id', userId)
    .single()

  const userPoints = (userData as unknown as { total_points: number | null } | null)?.total_points ?? 0

  // Get current tier based on points from skill_tier_config table
  const { data: tierData } = await (supabase as unknown as {
    from: (table: string) => {
      select: (columns: string) => {
        lte: (column: string, value: number) => {
          order: (column: string, options: { ascending: boolean }) => {
            limit: (count: number) => {
              single: () => Promise<{ data: unknown; error: unknown }>
            }
          }
        }
      }
    }
  })
    .from('skill_tier_config')
    .select('name')
    .lte('min_points', userPoints)
    .order('min_points', { ascending: false })
    .limit(1)
    .single()

  const userTierName = (tierData as { name: string } | null)?.name ?? 'Apprentice'

  // Get user's quest history to determine preferences (excluding abandoned quests)
  const { data: userQuestsData } = await supabase
    .from('user_quests')
    .select('quest_id, status, quests!inner(category_id)')
    .eq('user_id', userId)
    .neq('status', 'abandoned') // Exclude abandoned - user can re-accept these

  const userQuests = userQuestsData as Array<{ quest_id: string; status: string; quests: { category_id: string } }> | null
  const acceptedQuestIds = userQuests?.map(uq => uq.quest_id) || []
  const completedQuestIds = userQuests?.filter(uq => uq.status === 'completed').map(uq => uq.quest_id) || []
  const completedCategories = new Set(
    userQuests?.filter(uq => uq.status === 'completed').map((uq: any) => uq.quests?.category_id).filter(Boolean)
  )

  // Strategy 1: Featured quests not yet accepted, appropriate for user's tier
  // Exclude side quests - they shouldn't be recommended in "Your Path"
  // Use .or() to handle NULL values (is_side_quest can be NULL, false, or true)
  let featuredQuery = supabase
    .from('quests')
    .select('id, title, category_id, difficulty')
    .eq('status', 'published')
    .eq('featured', true)
    .or('is_side_quest.is.null,is_side_quest.eq.false')

  // Only add NOT IN filter if there are quests to exclude
  if (acceptedQuestIds.length > 0) {
    featuredQuery = featuredQuery.not('id', 'in', `(${acceptedQuestIds.join(',')})`)
  }

  const { data: featuredQuestsData } = await featuredQuery.limit(10)

  const featuredQuests = featuredQuestsData as Array<{ id: string; title: string; category_id: string; difficulty: QuestDifficulty | null }> | null

  if (featuredQuests && featuredQuests.length > 0) {
    // Filter to only quests user can accept (not locked by prerequisites) AND appropriate for tier
    for (const quest of featuredQuests) {
      // Skip quests above user's tier
      if (!isQuestAppropriateForTier(quest.difficulty, userTierName)) {
        continue
      }
      const canAccept = await canAcceptQuest(supabase, userId, quest.id)
      if (canAccept) {
        const isFamiliar = completedCategories.has(quest.category_id)
        return {
          quest_id: quest.id,
          quest_title: quest.title,
          reason: isFamiliar
            ? 'Featured quest in a category you\'ve explored'
            : 'Featured guild quest',
          match_score: isFamiliar ? 0.9 : 0.8,
        }
      }
    }
  }

  // Strategy 2: Quests in familiar categories, appropriate for tier
  // Exclude side quests
  if (completedCategories.size > 0) {
    const categoryIds = Array.from(completedCategories)
    let categoryQuery = supabase
      .from('quests')
      .select('id, title, difficulty')
      .eq('status', 'published')
      .in('category_id', categoryIds)
      .or('is_side_quest.is.null,is_side_quest.eq.false')

    if (acceptedQuestIds.length > 0) {
      categoryQuery = categoryQuery.not('id', 'in', `(${acceptedQuestIds.join(',')})`)
    }

    const { data: categoryQuestsData } = await categoryQuery.limit(10)

    const categoryQuests = categoryQuestsData as Array<{ id: string; title: string; difficulty: QuestDifficulty | null }> | null

    if (categoryQuests && categoryQuests.length > 0) {
      for (const quest of categoryQuests) {
        if (!isQuestAppropriateForTier(quest.difficulty, userTierName)) {
          continue
        }
        const canAccept = await canAcceptQuest(supabase, userId, quest.id)
        if (canAccept) {
          return {
            quest_id: quest.id,
            quest_title: quest.title,
            reason: 'Quest in a familiar category',
            match_score: 0.7,
          }
        }
      }
    }
  }

  // Strategy 3: Any available quests (not accepted, not locked, appropriate for tier)
  // Exclude side quests
  let availableQuery = supabase
    .from('quests')
    .select('id, title, difficulty')
    .eq('status', 'published')
    .or('is_side_quest.is.null,is_side_quest.eq.false')

  if (acceptedQuestIds.length > 0) {
    availableQuery = availableQuery.not('id', 'in', `(${acceptedQuestIds.join(',')})`)
  }

  const { data: availableQuestsData } = await availableQuery
    .order('created_at', { ascending: true }) // Older quests likely more popular
    .limit(10)

  const availableQuests = availableQuestsData as Array<{ id: string; title: string; difficulty: QuestDifficulty | null }> | null

  if (availableQuests && availableQuests.length > 0) {
    for (const quest of availableQuests) {
      if (!isQuestAppropriateForTier(quest.difficulty, userTierName)) {
        continue
      }
      const canAccept = await canAcceptQuest(supabase, userId, quest.id)
      if (canAccept) {
        return {
          quest_id: quest.id,
          quest_title: quest.title,
          reason: 'Available guild quest',
          match_score: 0.5,
        }
      }
    }
  }

  return null
}

/**
 * Hook to get quest recommendation for a user
 */
export function useQuestRecommendation(
  userId: string | undefined,
  hasActiveQuests: boolean = false
): RecommendationResult {
  const { data, isLoading, error } = useQuery({
    queryKey: ['quest-recommendation', userId],
    queryFn: () => fetchQuestRecommendation(userId!),
    enabled: !!userId && !hasActiveQuests, // Only fetch if no active quests
    staleTime: 1000 * 60 * 10, // 10 minutes
  })

  return {
    recommendation: data || null,
    isLoading,
    error,
  }
}
