'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/auth-context'
import type { Activity } from '@/lib/types/activity'

/**
 * Fetch user's own activities
 */
async function fetchUserActivity(userId: string, limit: number = 20): Promise<Activity[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching user activity:', error)
    throw error
  }

  return (data || []) as Activity[]
}

/**
 * Fetch another user's public activities (for public profile view)
 */
async function fetchPublicUserActivity(userId: string, limit: number = 20): Promise<Activity[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('user_id', userId)
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching public user activity:', error)
    throw error
  }

  return (data || []) as Activity[]
}

interface UseUserActivityOptions {
  userId?: string
  limit?: number
  enabled?: boolean
}

/**
 * Hook to fetch a user's activity feed
 * If userId matches the current user, fetches all activities
 * Otherwise, fetches only public activities
 */
export function useUserActivity(options: UseUserActivityOptions = {}) {
  const { user, isLoading: authLoading } = useAuth()
  const { userId, limit = 20, enabled = true } = options

  // Use provided userId or current user's id
  const targetUserId = userId || user?.id
  const isOwnProfile = targetUserId === user?.id

  return useQuery({
    queryKey: ['userActivity', targetUserId, limit, isOwnProfile],
    queryFn: async () => {
      if (!targetUserId) return []

      try {
        if (isOwnProfile) {
          return await fetchUserActivity(targetUserId, limit)
        } else {
          return await fetchPublicUserActivity(targetUserId, limit)
        }
      } catch (error) {
        console.error('Error fetching user activity:', error)
        return []
      }
    },
    enabled: enabled && !!targetUserId && !authLoading,
  })
}
