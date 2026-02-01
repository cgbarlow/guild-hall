'use client'

import { useMemo } from 'react'
import { ScrollText } from 'lucide-react'
import { QuestCard } from './quest-card'
import { useLockedQuests } from '@/lib/hooks/use-locked-quests'
import type { Quest } from '@/lib/types/quest'
import { getDifficultyOrder } from '@/lib/types/quest'
import { cn } from '@/lib/utils'

interface QuestListProps {
  quests: Quest[]
  isLoading?: boolean
  className?: string
  /** Map of questId -> userQuestId for quests the user is actively taking */
  activeQuestIds?: Map<string, string>
  /** Set of questIds the user has completed */
  completedQuestIds?: Set<string>
  /** Hide quests the user has completed */
  hideCompleted?: boolean
  /** Sort open quests before locked quests within each difficulty */
  sortByLockedStatus?: boolean
}

function QuestListSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-lg border bg-card p-6 animate-pulse"
        >
          <div className="space-y-3">
            <div className="h-4 w-16 bg-muted rounded" />
            <div className="h-6 w-3/4 bg-muted rounded" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-muted rounded" />
              <div className="h-4 w-2/3 bg-muted rounded" />
            </div>
            <div className="flex gap-4 pt-2">
              <div className="h-4 w-16 bg-muted rounded" />
              <div className="h-4 w-16 bg-muted rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <ScrollText className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold">No quests available</h3>
      <p className="text-sm text-muted-foreground mt-1">
        Check back later for new adventures!
      </p>
    </div>
  )
}

export function QuestList({
  quests,
  isLoading,
  className,
  activeQuestIds,
  completedQuestIds,
  hideCompleted = false,
  sortByLockedStatus = false,
}: QuestListProps) {
  const { data: lockedQuests } = useLockedQuests()

  // Process quests: filter and sort
  const processedQuests = useMemo(() => {
    if (!quests) return []

    // Create a map of quest -> locked status for sorting
    const questsWithStatus = quests.map((quest) => {
      const userQuestId = activeQuestIds?.get(quest.id)
      const isCompleted = completedQuestIds?.has(quest.id) ?? false
      const isLocked = !userQuestId && !isCompleted && lockedQuests?.isLocked(quest.id)
      return { quest, userQuestId, isCompleted, isLocked }
    })

    // Filter out completed quests if hideCompleted is true
    let filtered = hideCompleted
      ? questsWithStatus.filter((q) => !q.isCompleted)
      : questsWithStatus

    // Sort by difficulty first, then by locked status (open before locked)
    if (sortByLockedStatus) {
      filtered = filtered.sort((a, b) => {
        // Primary sort: difficulty
        const diffA = getDifficultyOrder(a.quest.difficulty)
        const diffB = getDifficultyOrder(b.quest.difficulty)
        if (diffA !== diffB) return diffA - diffB

        // Secondary sort: open (0) before locked (1)
        const lockedA = a.isLocked ? 1 : 0
        const lockedB = b.isLocked ? 1 : 0
        return lockedA - lockedB
      })
    }

    return filtered
  }, [quests, activeQuestIds, completedQuestIds, lockedQuests, hideCompleted, sortByLockedStatus])

  if (isLoading) {
    return <QuestListSkeleton />
  }

  if (!quests || quests.length === 0) {
    return <EmptyState />
  }

  if (processedQuests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <ScrollText className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">All quests completed!</h3>
        <p className="text-sm text-muted-foreground mt-1">
          You&apos;ve completed all available quests. Check back for new adventures!
        </p>
      </div>
    )
  }

  return (
    <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {processedQuests.map(({ quest, userQuestId, isCompleted, isLocked }) => {
        const incompletePrerequisites = isLocked ? lockedQuests?.getIncompletePrerequisites(quest.id) : undefined

        return (
          <QuestCard
            key={quest.id}
            quest={quest}
            userQuestId={userQuestId}
            isLocked={isLocked}
            isCompleted={isCompleted}
            incompletePrerequisites={incompletePrerequisites}
          />
        )
      })}
    </div>
  )
}
