'use client'

import { ObjectiveItem } from './objective-item'
import type { UserObjectiveWithDetails } from '@/lib/hooks/use-user-objectives'
import { cn } from '@/lib/utils'

interface ObjectiveChecklistProps {
  objectives: UserObjectiveWithDetails[]
  onSubmitEvidence?: (objectiveId: string) => void
  className?: string
}

export function ObjectiveChecklist({
  objectives,
  onSubmitEvidence,
  className,
}: ObjectiveChecklistProps) {
  // Sort objectives by display order
  const sortedObjectives = [...objectives].sort(
    (a, b) => (a.objective?.display_order || 0) - (b.objective?.display_order || 0)
  )

  // Create a map for quick dependency lookup
  const objectiveMap = new Map(
    sortedObjectives.map((o) => [o.objective_id, o])
  )

  // Get dependency title helper
  const getDependencyTitle = (dependsOnId: string | null | undefined): string | undefined => {
    if (!dependsOnId) return undefined
    const dependency = objectiveMap.get(dependsOnId)
    return dependency?.objective?.title
  }

  // Calculate progress
  const completedCount = objectives.filter((o) => o.status === 'approved').length
  const totalCount = objectives.length

  return (
    <div className={cn('space-y-4', className)}>
      {/* Progress Summary */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Objectives</span>
        <span className="font-medium">
          {completedCount} / {totalCount} completed
        </span>
      </div>

      {/* Objectives List */}
      <div className="space-y-3">
        {sortedObjectives.map((objective) => (
          <ObjectiveItem
            key={objective.id}
            userObjective={objective}
            dependencyTitle={getDependencyTitle(objective.objective?.depends_on_id)}
            onSubmitEvidence={onSubmitEvidence}
          />
        ))}
      </div>

      {/* Empty State */}
      {objectives.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No objectives found for this quest.
        </div>
      )}
    </div>
  )
}
