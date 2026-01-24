'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Quest, QuestFilters, QuestStatus, QuestDbStatus } from '@/lib/types/quest'

/**
 * Fetch quests from the database with optional filters
 */
async function fetchQuests(filters?: QuestFilters): Promise<Quest[]> {
  const supabase = createClient()

  // Build the query - only select published quests by default (available for users)
  let query = supabase
    .from('quests')
    .select('*')
    .eq('status', 'published' as QuestDbStatus)
    .eq('is_template', false)

  // Apply category filter if provided
  if (filters?.category_id) {
    query = query.eq('category_id', filters.category_id)
  }

  // Apply status filter if provided (array or single value)
  if (filters?.status) {
    const statuses = Array.isArray(filters.status) ? filters.status : [filters.status]
    // Convert our status types to database status types
    const dbStatuses = statuses.filter(
      (s): s is QuestDbStatus => ['draft', 'published', 'archived'].includes(s)
    )
    if (dbStatuses.length > 0) {
      query = supabase
        .from('quests')
        .select('*')
        .in('status', dbStatuses)
        .eq('is_template', filters?.is_template ?? false)
    }
  }

  // Apply search filter if provided (search both title and description)
  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }

  // Order by created_at descending (newest first)
  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  // Transform the data to match our Quest type
  return (data || []).map((quest) => ({
    id: quest.id,
    title: quest.title,
    description: quest.description,
    short_description: quest.description?.substring(0, 100) || null,
    status: quest.status as QuestStatus,
    points: quest.points,
    xp_reward: quest.points, // Alias for backward compatibility
    time_limit_days: quest.completion_days,
    completion_days: quest.completion_days,
    deadline: null, // Calculated per-user in user_quests
    acceptance_deadline: quest.acceptance_deadline,
    category_id: quest.category_id,
    category: null, // Loaded separately if needed
    is_template: quest.is_template,
    template_id: quest.template_id,
    narrative_context: quest.narrative_context,
    transformation_goal: quest.transformation_goal,
    reward_description: quest.reward_description,
    created_by: quest.created_by,
    created_at: quest.created_at,
    updated_at: quest.updated_at,
    published_at: quest.published_at,
    archived_at: quest.archived_at,
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
 * Hook to get available quests (published and not templates)
 */
export function useAvailableQuests(userId?: string, filters?: QuestFilters) {
  const questsQuery = useQuests(filters)

  // For now, return all published quests
  // User-specific filtering (already accepted, etc) will be added later
  const availableQuests = questsQuery.data?.filter(
    (quest) => quest.status === 'published'
  )

  return {
    ...questsQuery,
    data: availableQuests,
  }
}
