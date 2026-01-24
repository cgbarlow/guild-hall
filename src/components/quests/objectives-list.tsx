import { CheckCircle2, Circle, Lock } from 'lucide-react'
import type { Objective } from '@/lib/types/quest'
import { cn } from '@/lib/utils'

interface ObjectivesListProps {
  objectives: Objective[]
  // User progress on objectives (from user_objectives table)
  userProgress?: Map<string, { status: 'locked' | 'available' | 'submitted' | 'approved' | 'rejected' }>
  className?: string
}

export function ObjectivesList({ objectives, userProgress, className }: ObjectivesListProps) {
  if (!objectives || objectives.length === 0) {
    return (
      <div className={cn('text-sm text-muted-foreground', className)}>
        No objectives specified for this quest.
      </div>
    )
  }

  return (
    <ul className={cn('space-y-3', className)}>
      {objectives.map((objective) => {
        const progress = userProgress?.get(objective.id)
        const isCompleted = progress?.status === 'approved'
        const isLocked = progress?.status === 'locked'

        return (
          <li
            key={objective.id}
            className={cn(
              'flex items-start gap-3 text-sm',
              isCompleted && 'text-muted-foreground line-through',
              isLocked && 'text-muted-foreground opacity-60'
            )}
          >
            {isCompleted ? (
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            ) : isLocked ? (
              <Lock className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <span>{objective.title}</span>
              {objective.description && (
                <p className="text-xs text-muted-foreground mt-1">{objective.description}</p>
              )}
              {objective.points > 0 && (
                <span className="text-xs text-amber-600 ml-2">+{objective.points} pts</span>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
