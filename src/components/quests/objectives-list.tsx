import { CheckCircle2, Circle } from 'lucide-react'
import type { Objective } from '@/lib/types/quest'
import { cn } from '@/lib/utils'

interface ObjectivesListProps {
  objectives: Objective[]
  className?: string
}

export function ObjectivesList({ objectives, className }: ObjectivesListProps) {
  if (!objectives || objectives.length === 0) {
    return (
      <div className={cn('text-sm text-muted-foreground', className)}>
        No objectives specified for this quest.
      </div>
    )
  }

  return (
    <ul className={cn('space-y-3', className)}>
      {objectives.map((objective) => (
        <li
          key={objective.id}
          className={cn(
            'flex items-start gap-3 text-sm',
            objective.is_completed && 'text-muted-foreground line-through'
          )}
        >
          {objective.is_completed ? (
            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
          ) : (
            <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
          )}
          <span>{objective.description}</span>
        </li>
      ))}
    </ul>
  )
}
