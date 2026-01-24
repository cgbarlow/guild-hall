'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { User, Session } from '@supabase/supabase-js'

/**
 * Query key for user data
 */
export const userQueryKey = ['user'] as const

/**
 * Query key for session data
 */
export const sessionQueryKey = ['session'] as const

/**
 * Query key for GM role check
 */
export const isGMQueryKey = (userId: string | undefined) => ['isGM', userId] as const

/**
 * Hook to get the current authenticated user
 * Uses React Query for caching and automatic refetching
 */
export function useUser() {
  const supabase = createClient()

  return useQuery<User | null>({
    queryKey: userQueryKey,
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      return user
    },
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  })
}

/**
 * Hook to get the current session
 * Uses React Query for caching and automatic refetching
 */
export function useSession() {
  const supabase = createClient()

  return useQuery<Session | null>({
    queryKey: sessionQueryKey,
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession()
      return session
    },
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  })
}

/**
 * Hook to check if the current user has GM (Game Master) or Admin role
 * Returns false if user is not authenticated or doesn't have the role
 */
export function useIsGM() {
  const { data: user } = useUser()
  const supabase = createClient()

  return useQuery<boolean>({
    queryKey: isGMQueryKey(user?.id),
    queryFn: async () => {
      if (!user) return false

      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .in('role', ['gm', 'admin'])

      return !!data && data.length > 0
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  })
}

/**
 * Hook to get user profile data from the users table
 * Returns null if user is not authenticated
 */
export function useUserProfile() {
  const { data: user } = useUser()
  const supabase = createClient()

  return useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: async () => {
      if (!user) return null

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error fetching user profile:', error)
        return null
      }

      return data
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}
