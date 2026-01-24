'use client'

import { Clock, User, Scroll, Calendar, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { ExtensionRequest } from '@/lib/hooks/use-extension-requests'
import { cn } from '@/lib/utils'
import { ExtensionActions } from './extension-actions'

interface ExtensionCardProps {
  request: ExtensionRequest
  className?: string
  onApprove?: () => void
  onDeny?: () => void
}

function formatDate(dateString: string | null): string {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function getTimeSince(dateString: string | null): string {
  if (!dateString) return 'Unknown'
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  }
  if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  }
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`
}

function getDaysRemaining(deadline: string | null): { days: number; isOverdue: boolean } {
  if (!deadline) return { days: 0, isOverdue: false }
  const deadlineDate = new Date(deadline)
  const now = new Date()
  const diffMs = deadlineDate.getTime() - now.getTime()
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  return { days: Math.abs(days), isOverdue: diffMs < 0 }
}

export function ExtensionCard({ request, className, onApprove, onDeny }: ExtensionCardProps) {
  const user = request.user
  const quest = request.quest
  const deadlineInfo = getDaysRemaining(request.deadline)

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span className="font-medium">{user?.display_name || 'Unknown User'}</span>
            </div>
            <CardTitle className="text-lg leading-tight truncate flex items-center gap-2">
              <Scroll className="h-5 w-5 shrink-0" />
              {quest?.title || 'Unknown Quest'}
            </CardTitle>
          </div>
          <Badge
            variant={deadlineInfo.isOverdue ? 'destructive' : 'outline'}
            className="shrink-0"
          >
            {deadlineInfo.isOverdue ? 'Overdue' : `${deadlineInfo.days} days left`}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Deadline */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Current deadline:</span>
            <span className={cn('font-medium', deadlineInfo.isOverdue && 'text-destructive')}>
              {formatDate(request.deadline)}
            </span>
          </div>
        </div>

        {/* Extension Reason */}
        {request.extension_reason && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">Reason for extension:</p>
            <div className="rounded-md bg-muted p-3">
              <p className="text-sm">{request.extension_reason}</p>
            </div>
          </div>
        )}

        {/* Requested Time */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>Requested {getTimeSince(request.extension_requested_at)}</span>
        </div>

        {/* Actions */}
        <ExtensionActions
          userQuestId={request.id}
          currentDeadline={request.deadline}
          completionDays={quest?.completion_days || 7}
          onApprove={onApprove}
          onDeny={onDeny}
        />
      </CardContent>
    </Card>
  )
}
