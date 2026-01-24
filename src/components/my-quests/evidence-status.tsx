'use client'

import { Clock, CheckCircle2, XCircle, FileText, Link as LinkIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EvidenceStatusProps {
  status: 'submitted' | 'approved' | 'rejected'
  evidenceText?: string | null
  evidenceUrl?: string | null
  submittedAt?: string | null
  reviewedAt?: string | null
  feedback?: string | null
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

export function EvidenceStatus({
  status,
  evidenceText,
  evidenceUrl,
  submittedAt,
  reviewedAt,
  feedback,
  className,
}: EvidenceStatusProps) {
  const statusConfig = {
    submitted: {
      icon: Clock,
      label: 'Pending Review',
      color: 'text-amber-500',
      bgColor: 'bg-amber-50 dark:bg-amber-950/20',
      borderColor: 'border-amber-200 dark:border-amber-900',
    },
    approved: {
      icon: CheckCircle2,
      label: 'Approved',
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-950/20',
      borderColor: 'border-green-200 dark:border-green-900',
    },
    rejected: {
      icon: XCircle,
      label: 'Rejected',
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
        {submittedAt && (
          <span className="text-xs text-muted-foreground">
            Submitted {formatDate(submittedAt)}
          </span>
        )}
      </div>

      {/* Evidence Content */}
      <div className="space-y-2">
        {evidenceText && (
          <div className="flex items-start gap-2">
            <FileText className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
            <p className="text-sm">{evidenceText}</p>
          </div>
        )}
        {evidenceUrl && (
          <div className="flex items-center gap-2">
            <LinkIcon className="h-4 w-4 text-muted-foreground shrink-0" />
            <a
              href={evidenceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline truncate"
            >
              {evidenceUrl}
            </a>
          </div>
        )}
      </div>

      {/* Review Info */}
      {status !== 'submitted' && reviewedAt && (
        <div className="text-xs text-muted-foreground">
          Reviewed {formatDate(reviewedAt)}
        </div>
      )}

      {/* Feedback */}
      {feedback && (
        <div className="pt-2 border-t">
          <p className="text-xs font-medium text-muted-foreground mb-1">GM Feedback:</p>
          <p className="text-sm">{feedback}</p>
        </div>
      )}
    </div>
  )
}
