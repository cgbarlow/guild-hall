'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNotifications, type Notification } from '@/lib/hooks/use-notifications'
import { useMarkNotificationRead } from '@/lib/hooks/use-mark-notification-read'
import { NotificationItem } from './notification-item'
import { MarkAllRead } from './mark-all-read'
import { getNotificationLink } from '@/lib/types/notification'

interface NotificationDropdownProps {
  onClose?: () => void
}

/**
 * Notification dropdown list component
 */
export function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: notifications, isLoading, error } = useNotifications({
    limit: 10,
  })

  const markAsRead = useMarkNotificationRead()

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if not already
    if (!notification.read) {
      await markAsRead.mutateAsync(notification.id)
    }

    // Navigate to the relevant page
    const link = getNotificationLink(notification)
    if (link) {
      router.push(link)
    }

    onClose?.()
  }

  const unreadCount = notifications?.filter(n => !n.read).length || 0

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        Failed to load notifications
      </div>
    )
  }

  if (!notifications || notifications.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground">
        No notifications yet
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b">
        <h3 className="font-semibold text-sm">Notifications</h3>
        {unreadCount > 0 && <MarkAllRead />}
      </div>

      {/* Notification list */}
      <div className="max-h-[400px] overflow-y-auto divide-y">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onClick={handleNotificationClick}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="border-t p-2">
        <Button
          variant="ghost"
          className="w-full text-sm"
          asChild
          onClick={onClose}
        >
          <Link href="/notifications">View all notifications</Link>
        </Button>
      </div>
    </div>
  )
}
