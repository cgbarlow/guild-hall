'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/auth-context'
import { useIsGM } from '@/lib/auth/hooks'
import type { Database } from '@/lib/types/database'

type UserObjectiveRow = Database['public']['Tables']['user_objectives']['Row']
type UserRow = Database['public']['Tables']['users']['Row']
type QuestRow = Database['public']['Tables']['quests']['Row']
type ObjectiveRow = Database['public']['Tables']['objectives']['Row']
type UserQuestRow = Database['public']['Tables']['user_quests']['Row']

export interface PendingSubmission extends UserObjectiveRow {
  user_quest: Pick<UserQuestRow, 'id' | 'user_id' | 'quest_id' | 'status'> & {
    user: Pick<UserRow, 'id' | 'display_name' | 'email' | 'total_points'> | null
    quest: Pick<QuestRow, 'id' | 'title' | 'points'> | null
  }
  objective: Pick<ObjectiveRow, 'id' | 'title' | 'description' | 'points' | 'evidence_type'> | null
}

export interface UsePendingSubmissionsOptions {
  questId?: string
  enabled?: boolean
}

// Type for joined query result
type PendingSubmissionQueryResult = UserObjectiveRow & {
  user_quests: {
    id: string
    user_id: string
    quest_id: string
    status: string
    users: Pick<UserRow, 'id' | 'display_name' | 'email' | 'total_points'> | null
    quests: Pick<QuestRow, 'id' | 'title' | 'points'> | null
  }
  objectives: Pick<ObjectiveRow, 'id' | 'title' | 'description' | 'points' | 'evidence_type'> | null
}

/**
 * Fetch pending evidence submissions for GM review
 */
async function fetchPendingSubmissions(
  questId?: string
): Promise<PendingSubmission[]> {
  const supabase = createClient()

  let query = supabase
    .from('user_objectives')
    .select(`
      *,
      user_quests!inner (
        id,
        user_id,
        quest_id,
        status,
        users (
          id,
          display_name,
          email,
          total_points
        ),
        quests (
          id,
          title,
          points
        )
      ),
      objectives (
        id,
        title,
        description,
        points,
        evidence_type
      )
    `)
    .eq('status', 'submitted')

  // Filter by quest if provided
  if (questId) {
    query = query.eq('user_quests.quest_id', questId)
  }

  // Order by submitted_at (oldest first for FIFO processing)
  const { data: rawData, error } = await query.order('submitted_at', { ascending: true })

  if (error) {
    throw error
  }

  const data = (rawData || []) as unknown as PendingSubmissionQueryResult[]

  // Transform the data to match our interface
  return data.map((item) => ({
    ...item,
    user_quest: {
      id: item.user_quests.id,
      user_id: item.user_quests.user_id,
      quest_id: item.user_quests.quest_id,
      status: item.user_quests.status,
      user: item.user_quests.users,
      quest: item.user_quests.quests,
    },
    objective: item.objectives,
    user_quests: undefined,
    objectives: undefined,
  })) as PendingSubmission[]
}

/**
 * React Query hook for fetching pending submissions for GM review
 * Returns empty array if user is not authenticated or not a GM
 */
export function usePendingSubmissions(options: UsePendingSubmissionsOptions = {}) {
  const { questId, enabled = true } = options
  const { user, isLoading: authLoading } = useAuth()
  const { data: isGM, isLoading: gmLoading } = useIsGM()

  return useQuery({
    queryKey: ['pendingSubmissions', questId, user?.id],
    queryFn: async () => {
      // Graceful fallback: return empty array if not authenticated or not GM
      if (!user || !isGM) {
        return []
      }
      try {
        return await fetchPendingSubmissions(questId)
      } catch (error) {
        // Log error but return empty array for graceful degradation
        console.error('Error fetching pending submissions:', error)
        return []
      }
    },
    // Only run query when user is authenticated, GM check is complete, and explicitly enabled
    enabled: enabled && !!user && !authLoading && !gmLoading && isGM === true,
  })
}

/**
 * Get submission status display info
 */
export function getSubmissionStatusInfo(status: string): {
  label: string
  color: string
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
} {
  const statusMap: Record<string, { label: string; color: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    locked: { label: 'Locked', color: 'bg-gray-500', variant: 'outline' },
    available: { label: 'Available', color: 'bg-blue-500', variant: 'secondary' },
    submitted: { label: 'Pending Review', color: 'bg-amber-500', variant: 'default' },
    approved: { label: 'Approved', color: 'bg-green-500', variant: 'default' },
    rejected: { label: 'Rejected', color: 'bg-red-500', variant: 'destructive' },
  }

  return statusMap[status] || { label: status, color: 'bg-gray-500', variant: 'outline' }
}
