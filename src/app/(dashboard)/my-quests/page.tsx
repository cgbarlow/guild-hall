'use client'

import { useState, useMemo } from 'react'
import { Scroll } from 'lucide-react'
import { useUserQuests } from '@/lib/hooks/use-user-quests'
import { QuestStatusFilter } from '@/components/my-quests'
import { QuestCard } from '@/components/quests/quest-card'
import type { Database } from '@/lib/types/database'

type UserQuestStatus = Database['public']['Tables']['user_quests']['Row']['status']

// Status priority for sorting: in_progress first, then accepted, then completed
const STATUS_PRIORITY: Record<string, number> = {
  in_progress: 1,
  accepted: 2,
  ready_to_claim: 3,
  awaiting_final_approval: 4,
  completed: 5,
  abandoned: 6,
  expired: 7,
}

function LoadingSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="rounded-lg border bg-card p-6 animate-pulse">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-5 w-20 bg-muted rounded" />
              <div className="h-5 w-16 bg-muted rounded" />
            </div>
            <div className="h-6 w-3/4 bg-muted rounded" />
            <div className="h-4 w-full bg-muted rounded" />
            <div className="flex gap-4">
              <div className="h-4 w-16 bg-muted rounded" />
              <div className="h-4 w-24 bg-muted rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-12">
      <Scroll className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">No quests yet</h3>
      <p className="text-muted-foreground max-w-sm mx-auto">
        Head over to the Bounty Board to find quests to accept and start your adventure!
      </p>
    </div>
  )
}

export default function MyQuestsPage() {
  const [statusFilter, setStatusFilter] = useState<UserQuestStatus | 'all'>('all')

  // Fetch all user quests
  const { data: allQuests, isLoading, error } = useUserQuests()

  // Filter and sort quests based on selected status
  // By default, hide abandoned and expired quests
  const filteredQuests = useMemo(() => {
    const filtered = allQuests?.filter((quest) => {
      // Always hide abandoned and expired from the default "all" view
      if (statusFilter === 'all') {
        return quest.status !== 'abandoned' && quest.status !== 'expired'
      }
      return quest.status === statusFilter
    }) || []

    // Sort by status priority: in_progress, accepted, then completed
    return filtered.sort((a, b) => {
      const priorityA = STATUS_PRIORITY[a.status] || 99
      const priorityB = STATUS_PRIORITY[b.status] || 99
      return priorityA - priorityB
    })
  }, [allQuests, statusFilter])

  // Calculate counts for each status (exclude abandoned/expired from "all")
  const counts = {
    all: allQuests?.filter((q) => q.status !== 'abandoned' && q.status !== 'expired').length || 0,
    in_progress: allQuests?.filter((q) => q.status === 'in_progress').length || 0,
    accepted: allQuests?.filter((q) => q.status === 'accepted').length || 0,
    completed: allQuests?.filter((q) => q.status === 'completed').length || 0,
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Quests</h1>
          <p className="text-muted-foreground mt-1">
            Track your progress on accepted quests
          </p>
        </div>
      </div>

      {/* Status Filter */}
      <QuestStatusFilter
        value={statusFilter}
        onChange={setStatusFilter}
        counts={counts}
      />

      {/* Quest List */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : error ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
          <p className="text-destructive">Failed to load quests. Please try again.</p>
        </div>
      ) : filteredQuests.length === 0 ? (
        statusFilter === 'all' ? (
          <EmptyState />
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No quests with status &quot;{statusFilter.replace('_', ' ')}&quot;
            </p>
          </div>
        )
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredQuests.map((userQuest) => {
            // Transform userQuest.quest to QuestCardData format for QuestCard
            const questData = {
              id: userQuest.quest?.id || userQuest.quest_id,
              title: userQuest.quest?.title || 'Unknown Quest',
              description: userQuest.quest?.description || '',
              points: userQuest.quest?.points || 0,
              status: userQuest.quest?.status || 'published',
              time_limit_days: userQuest.quest?.completion_days || null,
              badge_url: userQuest.quest?.badge_url || null,
              category_id: userQuest.quest?.category_id || null,
            }

            return (
              <QuestCard
                key={userQuest.id}
                quest={questData}
                userQuestId={userQuest.id}
                userQuestStatus={userQuest.status}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
