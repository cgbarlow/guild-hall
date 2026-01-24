'use client'

import { CheckCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useMarkAllNotificationsRead } from '@/lib/hooks/use-mark-notification-read'

/**
 * Button to mark all notifications as read
 */
export function MarkAllRead() {
  const markAllRead = useMarkAllNotificationsRead()

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-xs h-7 px-2"
      onClick={() => markAllRead.mutate()}
      disabled={markAllRead.isPending}
    >
      <CheckCheck className="h-3.5 w-3.5 mr-1" />
      Mark all read
    </Button>
  )
}
