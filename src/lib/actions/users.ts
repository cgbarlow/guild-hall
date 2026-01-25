'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/types/database'

type UserRow = Database['public']['Tables']['users']['Row']
type UserRoleRow = Database['public']['Tables']['user_roles']['Row']

export interface UserWithRole {
  id: string
  email: string | null
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  location: string | null
  website: string | null
  points: number
  total_points: number
  level: number
  quests_completed: number
  quests_failed: number
  current_streak: number
  longest_streak: number
  title: string | null
  created_at: string
  updated_at: string
  role: UserRoleRow['role'] | null
}

export interface GetAllUsersOptions {
  search?: string
  roleFilter?: 'all' | 'gm' | 'admin' | 'member'
}

/**
 * Fetch all users (server action)
 * Uses service role to bypass RLS after verifying caller is GM
 */
export async function getAllUsers(options: GetAllUsersOptions = {}): Promise<UserWithRole[]> {
  // First, verify the user is authenticated and is a GM
  const authClient = await createClient()
  const { data: { user: currentUser } } = await authClient.auth.getUser()

  if (!currentUser) {
    console.log('[getAllUsers] No authenticated user')
    return []
  }

  console.log('[getAllUsers] Current user:', currentUser.id, currentUser.email)

  // Check if user is GM using auth client (respects RLS for own roles)
  const { data: userRoles } = await authClient
    .from('user_roles')
    .select('role')
    .eq('user_id', currentUser.id)

  const isGm = userRoles?.some(r => r.role === 'gm' || r.role === 'admin')
  console.log('[getAllUsers] User roles:', userRoles, 'Is GM:', isGm)

  if (!isGm) {
    console.log('[getAllUsers] User is not GM, returning empty')
    return []
  }

  // Use service client to bypass RLS for GM operations
  const supabase = createServiceClient()

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
    console.error('[getAllUsers] Error fetching users:', error)
    return []
  }

  console.log('[getAllUsers] Raw data count:', data?.length ?? 0)

  // Transform the data
  let users = (data || []).map((item: Record<string, unknown>) => {
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
      id: item.id as string,
      email: item.email as string | null,
      display_name: item.display_name as string | null,
      avatar_url: item.avatar_url as string | null,
      bio: item.bio as string | null,
      location: item.location as string | null,
      website: item.website as string | null,
      points: (item.points as number) ?? 0,
      total_points: (item.total_points as number) ?? 0,
      level: (item.level as number) ?? 1,
      quests_completed: (item.quests_completed as number) ?? 0,
      quests_failed: (item.quests_failed as number) ?? 0,
      current_streak: (item.current_streak as number) ?? 0,
      longest_streak: (item.longest_streak as number) ?? 0,
      title: item.title as string | null,
      created_at: item.created_at as string,
      updated_at: item.updated_at as string,
      role,
    }
  })

  // Apply role filter client-side
  if (options.roleFilter && options.roleFilter !== 'all') {
    users = users.filter(u => u.role === options.roleFilter)
  }

  return users
}

/**
 * Fetch a single user by ID with role (server action)
 */
export async function getUserById(userId: string): Promise<UserWithRole | null> {
  const supabase = await createClient()

  const { data: rawData, error } = await supabase
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
    console.error('Error fetching user:', error)
    return null
  }

  const item = rawData as Record<string, unknown>
  const roles = item.user_roles as { role: UserRoleRow['role'] }[] | null
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
    id: item.id as string,
    email: item.email as string | null,
    display_name: item.display_name as string | null,
    avatar_url: item.avatar_url as string | null,
    bio: item.bio as string | null,
    location: item.location as string | null,
    website: item.website as string | null,
    points: (item.points as number) ?? 0,
    total_points: (item.total_points as number) ?? 0,
    level: (item.level as number) ?? 1,
    quests_completed: (item.quests_completed as number) ?? 0,
    quests_failed: (item.quests_failed as number) ?? 0,
    current_streak: (item.current_streak as number) ?? 0,
    longest_streak: (item.longest_streak as number) ?? 0,
    title: item.title as string | null,
    created_at: item.created_at as string,
    updated_at: item.updated_at as string,
    role,
  }
}
