'use client'

import { Clock, CheckCircle2, XCircle, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ExtensionStatusProps {
  extensionRequested: boolean
  extensionRequestedAt?: string | null
  extensionReason?: string | null
  extensionApproved?: boolean | null
  extensionApprovedAt?: string | null
  newDeadline?: string | null
  className?: string
}

function formatDate(dateString: string | null): string {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function formatDeadline(dateString: string | null): string {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

type ExtensionStatusType = 'pending' | 'approved' | 'rejected' | 'none'

function getExtensionStatus(props: ExtensionStatusProps): ExtensionStatusType {
  if (!props.extensionRequested) {
    return 'none'
  }
  if (props.extensionApproved === true) {
    return 'approved'
  }
  if (props.extensionApproved === false) {
    return 'rejected'
  }
  return 'pending'
}

export function ExtensionStatus({
  extensionRequested,
  extensionRequestedAt,
  extensionReason,
  extensionApproved,
  extensionApprovedAt,
  newDeadline,
  className,
}: ExtensionStatusProps) {
  const status = getExtensionStatus({
    extensionRequested,
    extensionRequestedAt,
    extensionReason,
    extensionApproved,
    extensionApprovedAt,
    newDeadline,
  })

  if (status === 'none') {
    return null
  }

  const statusConfig = {
    pending: {
      icon: Clock,
      label: 'Extension Request Pending',
      color: 'text-amber-500',
      bgColor: 'bg-amber-50 dark:bg-amber-950/20',
      borderColor: 'border-amber-200 dark:border-amber-900',
    },
    approved: {
      icon: CheckCircle2,
      label: 'Extension Approved',
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-950/20',
      borderColor: 'border-green-200 dark:border-green-900',
    },
    rejected: {
      icon: XCircle,
      label: 'Extension Denied',
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-950/20',
      borderColor: 'border-red-200 dark:border-red-900',
    },
  }

  const config = statusConfig[status]
  const StatusIcon = config.icon

  return (
    <div
      className={cn(
        'rounded-lg border p-4 space-y-3',
        config.bgColor,
        config.borderColor,
        className
      )}
    >
      {/* Status Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StatusIcon className={cn('h-5 w-5', config.color)} />
          <span className={cn('font-medium', config.color)}>{config.label}</span>
        </div>
        {extensionRequestedAt && (
          <span className="text-xs text-muted-foreground">
            Requested {formatDate(extensionRequestedAt)}
          </span>
        )}
      </div>

      {/* Reason */}
      {extensionReason && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Your reason:</p>
          <p className="text-sm">{extensionReason}</p>
        </div>
      )}

      {/* Approved - Show New Deadline */}
      {status === 'approved' && newDeadline && (
        <div className="pt-2 border-t space-y-1">
          <p className="text-xs font-medium text-muted-foreground">New deadline:</p>
          <p className="text-sm font-medium text-green-600 dark:text-green-400">
            {formatDeadline(newDeadline)}
          </p>
          {extensionApprovedAt && (
            <p className="text-xs text-muted-foreground">
              Approved {formatDate(extensionApprovedAt)}
            </p>
          )}
        </div>
      )}

      {/* Pending - Info Message */}
      {status === 'pending' && (
        <div className="flex items-start gap-2 pt-2 border-t">
          <HelpCircle className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
          <p className="text-xs text-muted-foreground">
            Your extension request is being reviewed by the Guild Master.
            You will be notified once a decision has been made.
          </p>
        </div>
      )}

      {/* Rejected - Info Message */}
      {status === 'rejected' && extensionApprovedAt && (
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            Reviewed {formatDate(extensionApprovedAt)}
          </p>
        </div>
      )}
    </div>
  )
}
