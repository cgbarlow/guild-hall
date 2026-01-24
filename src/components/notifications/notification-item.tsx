'use client'

import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import type { Notification } from '@/lib/hooks/use-notifications'
import { getNotificationIcon, getNotificationColor } from './notification-content'

export interface NotificationItemProps {
  notification: Notification
  onClick?: (notification: Notification) => void
}

/**
 * Single notification item component
 */
export function NotificationItem({ notification, onClick }: NotificationItemProps) {
  const Icon = getNotificationIcon(notification.type)
  const colorClass = getNotificationColor(notification.type)
  const timeAgo = formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })

  return (
    <button
      onClick={() => onClick?.(notification)}
      className={cn(
        'w-full flex items-start gap-3 p-3 text-left transition-colors hover:bg-muted/50',
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
            <span className="flex-shrink-0 h-2 w-2 rounded-full bg-primary" />
          )}
        </div>

        {notification.message && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
            {notification.message}
          </p>
        )}

        <p className="text-xs text-muted-foreground mt-1">
          {timeAgo}
        </p>
      </div>
    </button>
  )
}
