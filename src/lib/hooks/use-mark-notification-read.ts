'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/auth-context'

/**
 * Mutation to mark a single notification as read
 */
export function useMarkNotificationRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const supabase = createClient()

      const { error } = await (supabase
        .from('notifications') as ReturnType<typeof supabase.from>)
        .update({
          read: true,
          read_at: new Date().toISOString(),
        } as Record<string, unknown>)
        .eq('id', notificationId)

      if (error) throw error
    },
    onSuccess: () => {
      // Invalidate notifications queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

/**
 * Mutation to mark all notifications as read for the current user
 */
export function useMarkAllNotificationsRead() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated')

      const supabase = createClient()

      const { error } = await (supabase
        .from('notifications') as ReturnType<typeof supabase.from>)
        .update({
          read: true,
          read_at: new Date().toISOString(),
        } as Record<string, unknown>)
        .eq('user_id', user.id)
        .eq('read', false)

      if (error) throw error
    },
    onSuccess: () => {
      // Invalidate notifications queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}
