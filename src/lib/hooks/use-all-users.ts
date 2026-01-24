'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/types/database'

type UserRow = Database['public']['Tables']['users']['Row']
type UserRoleRow = Database['public']['Tables']['user_roles']['Row']

export interface UserWithRole extends UserRow {
  role: UserRoleRow['role'] | null
  questsInProgress?: number
}

export interface UseAllUsersOptions {
  search?: string
  roleFilter?: 'all' | 'gm' | 'admin' | 'member'
  enabled?: boolean
}

/**
 * Fetch all users for GM view
 */
async function fetchAllUsers(options: UseAllUsersOptions = {}): Promise<UserWithRole[]> {
  const supabase = createClient()

  let query = supabase
    .from('users')
    .select(`
      *,
      user_roles (
        role
      )
    `)
    .order('total_points', { ascending: false })

  // Apply search filter
  if (options.search) {
    query = query.or(`display_name.ilike.%${options.search}%,email.ilike.%${options.search}%`)
  }

  const { data, error } = await query

  if (error) {
    throw error
  }

  // Transform the data
  let users = (data || []).map((item) => {
    const roles = item.user_roles as { role: UserRoleRow['role'] }[] | null
    // Get the highest priority role
    let role: UserRoleRow['role'] | null = null
    if (roles && roles.length > 0) {
      if (roles.some(r => r.role === 'admin')) {
        role = 'admin'
      } else if (roles.some(r => r.role === 'gm')) {
        role = 'gm'
      } else {
        role = 'member'
      }
    }

    return {
      ...item,
      role,
      user_roles: undefined,
    }
  }) as UserWithRole[]

  // Apply role filter client-side
  if (options.roleFilter && options.roleFilter !== 'all') {
    users = users.filter(u => u.role === options.roleFilter)
  }

  return users
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

  const { data, error } = await supabase
    .from('user_quests')
    .select('id, status')
    .eq('user_id', userId)

  if (error) {
    throw error
  }

  const total = data?.length ?? 0
  const active = data?.filter(q => ['accepted', 'in_progress'].includes(q.status)).length ?? 0
  const completed = data?.filter(q => q.status === 'completed').length ?? 0

  return { active, completed, total }
}

/**
 * React Query hook for fetching all users (GM view)
 */
export function useAllUsers(options: UseAllUsersOptions = {}) {
  const { search, roleFilter, enabled = true } = options

  return useQuery({
    queryKey: ['allUsers', search, roleFilter],
    queryFn: () => fetchAllUsers({ search, roleFilter }),
    enabled,
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
 * Fetch a single user with full details
 */
async function fetchUserDetail(userId: string): Promise<UserWithRole | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('users')
    .select(`
      *,
      user_roles (
        role
      )
    `)
    .eq('id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw error
  }

  const roles = data.user_roles as { role: UserRoleRow['role'] }[] | null
  let role: UserRoleRow['role'] | null = null
  if (roles && roles.length > 0) {
    if (roles.some(r => r.role === 'admin')) {
      role = 'admin'
    } else if (roles.some(r => r.role === 'gm')) {
      role = 'gm'
    } else {
      role = 'member'
    }
  }

  return {
    ...data,
    role,
    user_roles: undefined,
  } as UserWithRole
}

/**
 * React Query hook for fetching a single user
 */
export function useUserDetail(userId: string | undefined) {
  return useQuery({
    queryKey: ['userDetail', userId],
    queryFn: () => fetchUserDetail(userId!),
    enabled: !!userId,
  })
}

/**
 * Fetch user's quest history
 */
async function fetchUserQuestHistory(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
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

  return (data || []).map((item) => ({
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
