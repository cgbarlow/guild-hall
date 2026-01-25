'use client'

import { useState } from 'react'
import { Lock, Circle, Clock, CheckCircle2, XCircle, FileText, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DependencyIndicator } from './dependency-indicator'
import { getUserObjectiveStatusInfo, type UserObjectiveWithDetails } from '@/lib/hooks/use-user-objectives'
import { useMarkObjectiveComplete } from '@/lib/hooks/use-mark-objective-complete'
import { cn } from '@/lib/utils'

interface ObjectiveItemProps {
  userObjective: UserObjectiveWithDetails
  dependencyTitle?: string
  onSubmitEvidence?: (objectiveId: string) => void
  className?: string
}

const statusIcons = {
  lock: Lock,
  circle: Circle,
  clock: Clock,
  check: CheckCircle2,
  x: XCircle,
}

export function ObjectiveItem({
  userObjective,
  dependencyTitle,
  onSubmitEvidence,
  className,
}: ObjectiveItemProps) {
  const statusInfo = getUserObjectiveStatusInfo(userObjective.status)
  const StatusIcon = statusIcons[statusInfo.icon]
  const isLocked = userObjective.status === 'locked'
  const requiresEvidence = userObjective.objective?.evidence_required
  const canSubmit = userObjective.status === 'available' && requiresEvidence
  const canMarkComplete = userObjective.status === 'available' && !requiresEvidence
  const isCompleted = userObjective.status === 'approved'

  const markComplete = useMarkObjectiveComplete()
  const [isMarking, setIsMarking] = useState(false)

  const handleMarkComplete = async () => {
    setIsMarking(true)
    try {
      await markComplete.mutateAsync(userObjective.id)
    } catch (error) {
      console.error('Failed to mark objective complete:', error)
    } finally {
      setIsMarking(false)
    }
  }

  return (
    <div
      className={cn(
        'border rounded-lg p-4 transition-colors',
        isLocked && 'bg-muted/50 opacity-75',
        isCompleted && 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900',
        className
      )}
    >
      <div className="flex items-start gap-3">
        {/* Status Icon */}
        <StatusIcon
          className={cn('h-5 w-5 mt-0.5 shrink-0', statusInfo.color)}
        />

        <div className="flex-1 min-w-0">
          {/* Title and Points */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4
                className={cn(
                  'font-medium',
                  isLocked && 'text-muted-foreground',
                  isCompleted && 'line-through text-muted-foreground'
                )}
              >
                {userObjective.objective?.title || 'Untitled Objective'}
              </h4>
              {userObjective.objective?.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {userObjective.objective.description}
                </p>
              )}
            </div>
            <span className="text-sm font-medium text-muted-foreground shrink-0">
              {userObjective.objective?.points || 0} pts
            </span>
          </div>

          {/* Dependency Indicator */}
          {isLocked && (
            <DependencyIndicator
              isLocked={isLocked}
              dependencyTitle={dependencyTitle}
              className="mt-2"
            />
          )}

          {/* Status and Actions */}
          <div className="flex items-center justify-between mt-3">
            <span className={cn('text-xs font-medium', statusInfo.color)}>
              {statusInfo.label}
            </span>

            {/* Submit Evidence Button */}
            {canSubmit && onSubmitEvidence && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onSubmitEvidence(userObjective.objective_id)}
              >
                <FileText className="h-4 w-4 mr-1" />
                Submit Evidence
              </Button>
            )}

            {/* Mark Complete Button (for objectives without evidence requirement) */}
            {canMarkComplete && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleMarkComplete}
                disabled={isMarking}
              >
                {isMarking ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-1" />
                )}
                Mark Complete
              </Button>
            )}

            {/* Show submitted evidence indicator */}
            {userObjective.status === 'submitted' && (
              <span className="text-xs text-amber-500">
                Awaiting GM review
              </span>
            )}
          </div>

          {/* Feedback from GM */}
          {userObjective.feedback && (
            <div className="mt-3 p-2 rounded bg-muted/50 text-sm">
              <span className="font-medium">GM Feedback:</span>{' '}
              {userObjective.feedback}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
