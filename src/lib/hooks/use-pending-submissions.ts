'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
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
  const { data, error } = await query.order('submitted_at', { ascending: true })

  if (error) {
    throw error
  }

  // Transform the data to match our interface
  return (data || []).map((item) => {
    const userQuests = item.user_quests as Record<string, unknown>
    return {
      ...item,
      user_quest: {
        id: userQuests.id as string,
        user_id: userQuests.user_id as string,
        quest_id: userQuests.quest_id as string,
        status: userQuests.status as string,
        user: userQuests.users as PendingSubmission['user_quest']['user'],
        quest: userQuests.quests as PendingSubmission['user_quest']['quest'],
      },
      objective: item.objectives as PendingSubmission['objective'],
      user_quests: undefined,
      objectives: undefined,
    }
  }) as PendingSubmission[]
}

/**
 * React Query hook for fetching pending submissions for GM review
 */
export function usePendingSubmissions(options: UsePendingSubmissionsOptions = {}) {
  const { questId, enabled = true } = options

  return useQuery({
    queryKey: ['pendingSubmissions', questId],
    queryFn: () => fetchPendingSubmissions(questId),
    enabled,
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
