'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/auth-context'
import { useIsGM } from '@/lib/auth/hooks'
import type { Quest, GMQuestFilters, QuestStatus, QuestDbStatus } from '@/lib/types/quest'
import type { Database } from '@/lib/types/database'

type QuestRow = Database['public']['Tables']['quests']['Row']

/**
 * Fetch all quests for GM view (includes draft, published, archived)
 */
async function fetchGMQuests(filters?: GMQuestFilters): Promise<Quest[]> {
  const supabase = createClient()

  // Build the query - GMs can see all quests regardless of status
  let query = supabase
    .from('quests')
    .select('*')
    .eq('is_template', filters?.is_template ?? false)

  // Apply status filter if provided
  if (filters?.status) {
    const statuses = Array.isArray(filters.status) ? filters.status : [filters.status]
    // Filter to only valid database statuses
    const dbStatuses = statuses.filter(
      (s): s is QuestDbStatus => ['draft', 'published', 'archived'].includes(s)
    )
    if (dbStatuses.length > 0) {
      query = query.in('status', dbStatuses)
    }
  }

  // Apply category filter if provided
  if (filters?.category_id) {
    query = query.eq('category_id', filters.category_id)
  }

  // Apply search filter if provided
  if (filters?.search) {
    query = query.ilike('title', `%${filters.search}%`)
  }

  // Apply created_by filter if provided
  if (filters?.created_by) {
    query = query.eq('created_by', filters.created_by)
  }

  // Order by created_at descending (newest first)
  const { data: rawData, error } = await query.order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  const data = (rawData || []) as unknown as QuestRow[]

  // Transform the data to match our Quest type
  return data.map((quest) => ({
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
 * React Query hook to fetch all quests for GM management
 * Unlike useQuests, this includes draft, published, and archived quests
 * Returns empty array if user is not authenticated or not a GM
 */
export function useGMQuests(filters?: GMQuestFilters) {
  const { user, isLoading: authLoading } = useAuth()
  const { data: isGM, isLoading: gmLoading } = useIsGM()

  return useQuery({
    queryKey: ['gm-quests', filters, user?.id],
    queryFn: async () => {
      // Graceful fallback: return empty array if not authenticated or not GM
      if (!user || !isGM) {
        return []
      }
      try {
        return await fetchGMQuests(filters)
      } catch (error) {
        // Log error but return empty array for graceful degradation
        console.error('Error fetching GM quests:', error)
        return []
      }
    },
    // Only run query when user is authenticated, GM check is complete
    enabled: !!user && !authLoading && !gmLoading && isGM === true,
  })
}

/**
 * Get counts of quests by status for dashboard
 */
export function useGMQuestCounts() {
  const { data: quests, ...rest } = useGMQuests()

  const counts = {
    draft: quests?.filter((q) => q.status === 'draft').length ?? 0,
    published: quests?.filter((q) => q.status === 'published').length ?? 0,
    archived: quests?.filter((q) => q.status === 'archived').length ?? 0,
    total: quests?.length ?? 0,
  }

  return {
    ...rest,
    data: counts,
  }
}
