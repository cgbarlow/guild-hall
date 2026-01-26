'use client'

import { useState } from 'react'
import { useGMQuests } from '@/lib/hooks/use-gm-quests'
import { GMQuestCard } from './gm-quest-card'
import { StatusFilter } from './status-filter'
import { DifficultyFilter } from '@/components/quests/difficulty-filter'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Plus, Search } from 'lucide-react'
import Link from 'next/link'
import type { QuestDbStatus, QuestDifficulty } from '@/lib/types/quest'
import { Skeleton } from '@/components/ui/skeleton'

interface GMQuestListProps {
  className?: string
}

function QuestListSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="rounded-lg border p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-5 w-40" />
            </div>
            <Skeleton className="h-5 w-20" />
          </div>
          <Skeleton className="mt-4 h-10 w-full" />
          <div className="mt-4 flex items-center gap-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function GMQuestList({ className }: GMQuestListProps) {
  const [statusFilter, setStatusFilter] = useState<QuestDbStatus | 'all'>('all')
  const [difficultyFilter, setDifficultyFilter] = useState<QuestDifficulty | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const { data: quests, isLoading, error } = useGMQuests({
    status: statusFilter === 'all' ? undefined : statusFilter,
    search: searchQuery || undefined,
    difficulty: difficultyFilter ?? undefined,
  })

  const handleArchive = (questId: string) => {
    // TODO: Implement archive mutation in Phase 5.5
    console.log('Archive quest:', questId)
  }

  const handleDelete = (questId: string) => {
    // TODO: Implement delete mutation in Phase 5.5
    console.log('Delete quest:', questId)
  }

  return (
    <div className={className}>
      {/* Header with filters and actions */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search quests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <StatusFilter
              value={statusFilter}
              onChange={setStatusFilter}
              className="w-40"
            />
          </div>
          <Button asChild>
            <Link href="/gm/quests/new">
              <Plus className="mr-2 h-4 w-4" />
              New Quest
            </Link>
          </Button>
        </div>
        <DifficultyFilter
          selectedDifficulty={difficultyFilter}
          onDifficultyChange={setDifficultyFilter}
        />
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
          Failed to load quests. Please try again.
        </div>
      )}

      {/* Loading state */}
      {isLoading && <QuestListSkeleton />}

      {/* Empty state */}
      {!isLoading && !error && quests?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-muted-foreground mb-4">
            {searchQuery || statusFilter !== 'all' || difficultyFilter !== null
              ? 'No quests match your filters'
              : 'No quests yet'}
          </div>
          {!searchQuery && statusFilter === 'all' && (
            <Button asChild>
              <Link href="/gm/quests/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Quest
              </Link>
            </Button>
          )}
          {(searchQuery || statusFilter !== 'all' || difficultyFilter !== null) && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('')
                setStatusFilter('all')
                setDifficultyFilter(null)
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      )}

      {/* Quest grid */}
      {!isLoading && !error && quests && quests.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {quests.map((quest) => (
            <GMQuestCard
              key={quest.id}
              quest={quest}
              onArchive={handleArchive}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Results count */}
      {!isLoading && !error && quests && quests.length > 0 && (
        <div className="mt-4 text-sm text-muted-foreground">
          Showing {quests.length} quest{quests.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}
