'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Quest, QuestFilters, QuestStatus } from '@/lib/types/quest'

// Database quest status type (from the actual database schema)
type DbQuestStatus = 'open' | 'claimed' | 'submitted' | 'approved' | 'rejected'

/**
 * Fetch quests from the database with optional filters
 */
async function fetchQuests(filters?: QuestFilters): Promise<Quest[]> {
  const supabase = createClient()

  // Build the query - only select open quests by default (available for users)
  let query = supabase
    .from('quests')
    .select('*')
    .eq('status', 'open' as DbQuestStatus)

  // Apply category filter if provided (categories will be added later)
  // For now, we'll skip category filtering since the table doesn't exist yet

  // Apply status filter if provided (array or single value)
  if (filters?.status) {
    const statuses = Array.isArray(filters.status) ? filters.status : [filters.status]
    // Convert our status types to database status types
    const dbStatuses = statuses.filter(
      (s): s is DbQuestStatus => ['open', 'claimed', 'submitted', 'approved', 'rejected'].includes(s)
    )
    if (dbStatuses.length > 0) {
      query = supabase.from('quests').select('*').in('status', dbStatuses)
    }
  }

  // Order by created_at descending (newest first)
  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  // Transform the data to match our Quest type
  return (data || []).map((quest) => ({
    id: quest.id,
    guild_id: quest.guild_id,
    title: quest.title,
    description: quest.description,
    short_description: quest.description?.substring(0, 100) || null,
    status: quest.status as QuestStatus,
    points: quest.xp_reward,
    xp_reward: quest.xp_reward,
    time_limit_days: null, // Will be calculated from deadline if available
    deadline: null,
    category_id: null, // Categories not yet in schema
    category: null, // Categories not yet in schema
    created_by: quest.created_by,
    claimed_by: quest.claimed_by,
    created_at: quest.created_at,
    updated_at: quest.updated_at,
  }))
}

/**
 * React Query hook to fetch quests with optional filters
 */
export function useQuests(filters?: QuestFilters) {
  return useQuery({
    queryKey: ['quests', filters],
    queryFn: () => fetchQuests(filters),
  })
}

/**
 * Hook to get available quests (not claimed by current user)
 */
export function useAvailableQuests(userId?: string, filters?: QuestFilters) {
  const questsQuery = useQuests(filters)

  // Filter out quests already claimed by the current user
  const availableQuests = questsQuery.data?.filter(
    (quest) => quest.claimed_by !== userId && quest.status === 'open'
  )

  return {
    ...questsQuery,
    data: availableQuests,
  }
}
