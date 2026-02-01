'use client'

import Link from 'next/link'
import { Lock, CheckCircle2, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { QuestPrerequisite } from '@/lib/types/quest'

interface PrerequisitesDisplayProps {
  prerequisites: QuestPrerequisite[]
  className?: string
}

/**
 * Displays quest prerequisites with completion status
 */
export function PrerequisitesDisplay({
  prerequisites,
  className,
}: PrerequisitesDisplayProps) {
  if (!prerequisites || prerequisites.length === 0) {
    return null
  }

  const completedCount = prerequisites.filter((p) => p.is_completed).length
  const allComplete = completedCount === prerequisites.length

  return (
    <div className={cn('rounded-lg border p-4', className)}>
      <div className="flex items-center gap-2 mb-3">
        <Lock className={cn('h-5 w-5', allComplete ? 'text-green-500' : 'text-amber-500')} />
        <h4 className="font-semibold">
          Prerequisites
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            ({completedCount}/{prerequisites.length} completed)
          </span>
        </h4>
      </div>

      {!allComplete && (
        <p className="text-sm text-amber-600 dark:text-amber-400 mb-3">
          Complete the following quests to unlock this one:
        </p>
      )}

      <ul className="space-y-2">
        {prerequisites.map((prereq) => (
          <li key={prereq.prerequisite_quest_id} className="flex items-center gap-2">
            {prereq.is_completed ? (
              <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
            ) : (
              <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            )}
            <Link
              href={`/quests/${prereq.prerequisite_quest_id}`}
              className={cn(
                'text-sm hover:underline',
                prereq.is_completed
                  ? 'text-muted-foreground line-through'
                  : 'text-foreground font-medium'
              )}
            >
              {prereq.prerequisite_title}
            </Link>
          </li>
        ))}
      </ul>

      {allComplete && (
        <p className="text-sm text-green-600 dark:text-green-400 mt-3">
          ✓ All prerequisites completed! You can accept this quest.
        </p>
      )}
    </div>
  )
}
