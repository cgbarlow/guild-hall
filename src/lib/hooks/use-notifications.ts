'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/types/database'
import { useAuth } from '@/contexts/auth-context'

export type Notification = Database['public']['Tables']['notifications']['Row']

export interface UseNotificationsOptions {
  /** Only fetch unread notifications */
  unreadOnly?: boolean
  /** Limit the number of notifications */
  limit?: number
  /** Enable/disable the query */
  enabled?: boolean
}

/**
 * Fetch notifications for the current user
 */
async function fetchNotifications(
  userId: string,
  options: Omit<UseNotificationsOptions, 'enabled'>
): Promise<Notification[]> {
  const supabase = createClient()
  const { unreadOnly = false, limit } = options

  let query = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (unreadOnly) {
    query = query.eq('read', false)
  }

  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query

  if (error) {
    throw error
  }

  return data || []
}

/**
 * React Query hook for fetching user notifications
 */
export function useNotifications(options: UseNotificationsOptions = {}) {
  const { user } = useAuth()
  const { enabled = true, ...fetchOptions } = options

  return useQuery({
    queryKey: ['notifications', user?.id, fetchOptions],
    queryFn: () => {
      if (!user?.id) throw new Error('User not authenticated')
      return fetchNotifications(user.id, fetchOptions)
    },
    enabled: enabled && !!user?.id,
  })
}

/**
 * Hook for fetching unread notification count
 */
export function useUnreadNotificationCount() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['notifications', 'unread-count', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated')
      const supabase = createClient()

      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false)

      if (error) throw error
      return count || 0
    },
    enabled: !!user?.id,
  })
}
