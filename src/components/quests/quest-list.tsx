'use client'

import { ScrollText } from 'lucide-react'
import { QuestCard } from './quest-card'
import type { Quest } from '@/lib/types/quest'
import { cn } from '@/lib/utils'

interface QuestListProps {
  quests: Quest[]
  isLoading?: boolean
  className?: string
  /** Map of questId -> userQuestId for quests the user is actively taking */
  activeQuestIds?: Map<string, string>
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

export function QuestList({ quests, isLoading, className, activeQuestIds }: QuestListProps) {
  if (isLoading) {
    return <QuestListSkeleton />
  }

  if (!quests || quests.length === 0) {
    return <EmptyState />
  }

  return (
    <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {quests.map((quest) => (
        <QuestCard
          key={quest.id}
          quest={quest}
          userQuestId={activeQuestIds?.get(quest.id)}
        />
      ))}
    </div>
  )
}
