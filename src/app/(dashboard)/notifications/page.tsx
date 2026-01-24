'use client'

import { useRouter } from 'next/navigation'
import { formatDistanceToNow, format } from 'date-fns'
import { ArrowLeft, Loader2, Bell, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useNotifications, type Notification } from '@/lib/hooks/use-notifications'
import { useMarkNotificationRead } from '@/lib/hooks/use-mark-notification-read'
import { MarkAllRead } from '@/components/notifications/mark-all-read'
import { getNotificationIcon, getNotificationColor } from '@/components/notifications/notification-content'
import { getNotificationLink } from '@/lib/types/notification'
import { cn } from '@/lib/utils'

/**
 * Full notification history page
 */
export default function NotificationsPage() {
  const router = useRouter()
  const { data: notifications, isLoading, error } = useNotifications()
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
  }

  const unreadCount = notifications?.filter(n => !n.read).length || 0

  // Group notifications by date
  const groupedNotifications = notifications?.reduce((groups, notification) => {
    const date = format(new Date(notification.created_at), 'yyyy-MM-dd')
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(notification)
    return groups
  }, {} as Record<string, Notification[]>) || {}

  const sortedDates = Object.keys(groupedNotifications).sort((a, b) => b.localeCompare(a))

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Notifications</h1>
            <p className="text-sm text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
            </p>
          </div>
        </div>
        {unreadCount > 0 && <MarkAllRead />}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Failed to load notifications</p>
          </CardContent>
        </Card>
      ) : !notifications || notifications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No notifications yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              You will receive notifications when there are updates on your quests
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {sortedDates.map(date => {
            const dateLabel = getDateLabel(date)
            const items = groupedNotifications[date]

            return (
              <div key={date}>
                <h2 className="text-sm font-medium text-muted-foreground mb-3">
                  {dateLabel}
                </h2>
                <Card>
                  <div className="divide-y">
                    {items.map(notification => {
                      const Icon = getNotificationIcon(notification.type)
                      const colorClass = getNotificationColor(notification.type)
                      const timeAgo = formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })

                      return (
                        <button
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={cn(
                            'w-full flex items-start gap-4 p-4 text-left transition-colors hover:bg-muted/50',
                            !notification.read && 'bg-muted/30'
                          )}
                        >
                          {/* Icon */}
                          <div className={cn('flex-shrink-0 mt-0.5', colorClass)}>
                            <Icon className="h-5 w-5" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className={cn(
                                'text-sm',
                                !notification.read && 'font-medium'
                              )}>
                                {notification.title}
                              </p>
                              {!notification.read && (
                                <span className="flex-shrink-0 h-2 w-2 rounded-full bg-primary mt-1.5" />
                              )}
                            </div>

                            {notification.message && (
                              <p className="text-sm text-muted-foreground mt-0.5">
                                {notification.message}
                              </p>
                            )}

                            <p className="text-xs text-muted-foreground mt-1">
                              {timeAgo}
                            </p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </Card>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/**
 * Get a human-readable label for a date
 */
function getDateLabel(dateStr: string): string {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
    return 'Today'
  }

  if (format(date, 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd')) {
    return 'Yesterday'
  }

  // Check if it's within the last week
  const oneWeekAgo = new Date(today)
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  if (date > oneWeekAgo) {
    return format(date, 'EEEE') // Day name (e.g., "Monday")
  }

  // Check if it's this year
  if (date.getFullYear() === today.getFullYear()) {
    return format(date, 'MMMM d') // e.g., "January 15"
  }

  return format(date, 'MMMM d, yyyy') // e.g., "January 15, 2024"
}
