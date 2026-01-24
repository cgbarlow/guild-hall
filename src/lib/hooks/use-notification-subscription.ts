'use client'

import { useEffect, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/auth-context'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database'

type NotificationRow = Database['public']['Tables']['notifications']['Row']
type NotificationPayload = RealtimePostgresChangesPayload<NotificationRow>

/**
 * Subscribe to realtime notification updates for the current user
 * Automatically invalidates React Query cache when new notifications arrive
 */
export function useNotificationSubscription() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const invalidateNotifications = useCallback(() => {
    // Invalidate all notification-related queries
    queryClient.invalidateQueries({ queryKey: ['notifications'] })
  }, [queryClient])

  useEffect(() => {
    if (!user?.id) return

    const supabase = createClient()

    // Create a channel for the user's notifications
    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on<NotificationRow>(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload: NotificationPayload) => {
          // New notification received - invalidate cache to trigger refetch
          invalidateNotifications()

          // Optionally show browser notification if supported
          if ('Notification' in window && Notification.permission === 'granted') {
            const notification = payload.new as NotificationRow
            new Notification(notification.title, {
              body: notification.message || undefined,
              icon: '/favicon.ico',
            })
          }
        }
      )
      .on<NotificationRow>(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          // Notification updated (e.g., marked as read)
          invalidateNotifications()
        }
      )
      .on<NotificationRow>(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          // Notification deleted
          invalidateNotifications()
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          // Connection established - refetch to catch any missed events
          invalidateNotifications()
        }
      })

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id, invalidateNotifications])
}

/**
 * Request browser notification permission
 */
export function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission()
  }
}
