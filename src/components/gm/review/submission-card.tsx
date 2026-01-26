'use client'

import Link from 'next/link'
import { Clock, User, FileText, Link as LinkIcon, Eye, Award } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getSubmissionStatusInfo, type PendingSubmission } from '@/lib/hooks/use-pending-submissions'
import { cn } from '@/lib/utils'

interface SubmissionCardProps {
  submission: PendingSubmission
  className?: string
}

function formatDate(dateString: string | null): string {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
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

export function SubmissionCard({ submission, className }: SubmissionCardProps) {
  const user = submission.user_quest.user
  const quest = submission.user_quest.quest
  const objective = submission.objective
  const statusInfo = getSubmissionStatusInfo(submission.status)

  const hasTextEvidence = !!submission.evidence_text
  const hasUrlEvidence = !!submission.evidence_url

  return (
    <Card className={cn('hover:border-primary/50 transition-colors', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span className="font-medium">{user?.display_name || 'Unknown User'}</span>
              {user?.total_points !== undefined && (
                <Badge variant="outline" className="ml-1">
                  {user.total_points} pts
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg leading-tight truncate">
              {objective?.title || 'Unknown Objective'}
            </CardTitle>
            <p className="text-sm text-muted-foreground truncate">
              Quest: {quest?.title || 'Unknown Quest'}
            </p>
          </div>
          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {objective?.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {objective.description}
          </p>
        )}

        <div className="flex items-center gap-3 mb-4">
          {hasTextEvidence && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>Text Evidence</span>
            </div>
          )}
          {hasUrlEvidence && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <LinkIcon className="h-4 w-4" />
              <span>Link Evidence</span>
            </div>
          )}
          {objective?.points !== undefined && (
            <div className="flex items-center gap-1 text-sm text-amber-600">
              <Award className="h-4 w-4" />
              <span className="font-medium">{objective.points} pts</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>Submitted {getTimeSince(submission.submitted_at)}</span>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/gm/review/${submission.id}`}>
              <Eye className="mr-2 h-4 w-4" />
              Review
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
