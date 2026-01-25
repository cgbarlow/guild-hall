'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/auth-context'
import { getAllUsers, getUserById, type UserWithRole } from '@/lib/actions/users'
import type { Database } from '@/lib/types/database'

export type { UserWithRole }

export interface UseAllUsersOptions {
  search?: string
  roleFilter?: 'all' | 'gm' | 'admin' | 'member'
  enabled?: boolean
}

/**
 * Fetch quest counts for a user
 */
async function fetchUserQuestCounts(userId: string): Promise<{
  active: number
  completed: number
  total: number
}> {
  const supabase = createClient()

  // Type for query result
  type UserQuestResult = { id: string; status: string }

  const { data: rawData, error } = await supabase
    .from('user_quests')
    .select('id, status')
    .eq('user_id', userId)

  if (error) {
    throw error
  }

  const data = (rawData || []) as unknown as UserQuestResult[]
  const total = data.length
  const active = data.filter(q => ['accepted', 'in_progress'].includes(q.status)).length
  const completed = data.filter(q => q.status === 'completed').length

  return { active, completed, total }
}

/**
 * React Query hook for fetching all users (GM view)
 * Uses server action with service role to bypass RLS
 * Returns empty array if user is not authenticated or not a GM
 */
export function useAllUsers(options: UseAllUsersOptions = {}) {
  const { search, roleFilter, enabled = true } = options
  const { user, isLoading: authLoading } = useAuth()

  return useQuery({
    queryKey: ['allUsers', search, roleFilter, user?.id],
    queryFn: async () => {
      const result = await getAllUsers({ search, roleFilter })
      console.log('All users fetched:', result.length, 'users')
      return result
    },
    // Only run query when user is authenticated and auth check is complete
    enabled: enabled && !!user && !authLoading,
  })
}

/**
 * React Query hook for fetching user quest counts
 */
export function useUserQuestCounts(userId: string | undefined) {
  return useQuery({
    queryKey: ['userQuestCounts', userId],
    queryFn: () => fetchUserQuestCounts(userId!),
    enabled: !!userId,
  })
}

/**
 * React Query hook for fetching a single user
 * Uses server action with service role to bypass RLS
 */
export function useUserDetail(userId: string | undefined) {
  return useQuery({
    queryKey: ['userDetail', userId],
    queryFn: () => getUserById(userId!),
    enabled: !!userId,
  })
}

/**
 * Fetch user's quest history
 */
async function fetchUserQuestHistory(userId: string) {
  const supabase = createClient()

  // Type for joined query result
  type UserQuestWithQuest = Database['public']['Tables']['user_quests']['Row'] & {
    quests: { id: string; title: string; points: number; description: string | null } | null
  }

  const { data: rawData, error } = await supabase
    .from('user_quests')
    .select(`
      *,
      quests (
        id,
        title,
        points,
        description
      )
    `)
    .eq('user_id', userId)
    .order('accepted_at', { ascending: false })

  if (error) {
    throw error
  }

  const data = (rawData || []) as unknown as UserQuestWithQuest[]
  return data.map((item) => ({
    ...item,
    quest: item.quests,
    quests: undefined,
  }))
}

/**
 * React Query hook for fetching user's quest history
 */
export function useUserQuestHistory(userId: string | undefined) {
  return useQuery({
    queryKey: ['userQuestHistory', userId],
    queryFn: () => fetchUserQuestHistory(userId!),
    enabled: !!userId,
  })
}
