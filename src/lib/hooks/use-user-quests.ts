'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/types/database'

type UserQuestRow = Database['public']['Tables']['user_quests']['Row']
type QuestRow = Database['public']['Tables']['quests']['Row']
type UserQuestStatus = UserQuestRow['status']

export interface UserQuestWithQuest extends UserQuestRow {
  quest: Pick<QuestRow, 'id' | 'title' | 'description' | 'points' | 'status' | 'completion_days' | 'category_id'> | null
  objectivesCount?: number
  completedObjectivesCount?: number
}

// Type for joined query result
type UserQuestQueryResult = UserQuestRow & {
  quests: Pick<QuestRow, 'id' | 'title' | 'description' | 'points' | 'status' | 'completion_days' | 'category_id'> | null
}

export interface UseUserQuestsOptions {
  status?: UserQuestStatus | UserQuestStatus[]
  enabled?: boolean
}

/**
 * Fetch user's accepted quests with optional status filter
 */
async function fetchUserQuests(
  userId: string,
  status?: UserQuestStatus | UserQuestStatus[]
): Promise<UserQuestWithQuest[]> {
  const supabase = createClient()

  let query = supabase
    .from('user_quests')
    .select(`
      *,
      quests (
        id,
        title,
        description,
        points,
        status,
        completion_days,
        category_id
      )
    `)
    .eq('user_id', userId)
    .order('accepted_at', { ascending: false })

  // Apply status filter if provided
  if (status) {
    if (Array.isArray(status)) {
      query = query.in('status', status)
    } else {
      query = query.eq('status', status)
    }
  }

  const { data: rawData, error } = await query

  if (error) {
    throw error
  }

  const data = (rawData || []) as unknown as UserQuestQueryResult[]

  // Transform the data to match our interface
  return data.map((item) => ({
    ...item,
    quest: item.quests,
    quests: undefined,
  })) as UserQuestWithQuest[]
}

/**
 * React Query hook to fetch user's quests
 */
export function useUserQuests(options: UseUserQuestsOptions = {}) {
  const { status, enabled = true } = options

  return useQuery({
    queryKey: ['userQuests', status],
    queryFn: async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        return undefined
      }

      return fetchUserQuests(user.id, status)
    },
    enabled,
  })
}

/**
 * Calculate progress percentage for a user quest
 */
export function calculateQuestProgress(
  completedObjectives: number,
  totalObjectives: number
): number {
  if (totalObjectives === 0) return 0
  return Math.round((completedObjectives / totalObjectives) * 100)
}

/**
 * Get status display info
 */
export function getUserQuestStatusInfo(status: UserQuestStatus): {
  label: string
  color: string
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
} {
  const statusMap: Record<UserQuestStatus, { label: string; color: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    accepted: { label: 'Accepted', color: 'bg-blue-500', variant: 'secondary' },
    in_progress: { label: 'In Progress', color: 'bg-amber-500', variant: 'default' },
    completed: { label: 'Completed', color: 'bg-green-500', variant: 'default' },
    abandoned: { label: 'Abandoned', color: 'bg-gray-500', variant: 'outline' },
    expired: { label: 'Expired', color: 'bg-red-500', variant: 'destructive' },
  }

  return statusMap[status] || { label: status, color: 'bg-gray-500', variant: 'outline' }
}
