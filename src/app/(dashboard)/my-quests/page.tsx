'use client'

import { useState } from 'react'
import { Scroll } from 'lucide-react'
import { useUserQuests } from '@/lib/hooks/use-user-quests'
import { QuestProgressCard, QuestStatusFilter } from '@/components/my-quests'
import type { Database } from '@/lib/types/database'

type UserQuestStatus = Database['public']['Tables']['user_quests']['Row']['status']

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-lg border bg-card p-6 animate-pulse">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-5 w-20 bg-muted rounded" />
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

  // Filter quests based on selected status
  const filteredQuests = allQuests?.filter((quest) => {
    if (statusFilter === 'all') return true
    return quest.status === statusFilter
  }) || []

  // Calculate counts for each status
  const counts = {
    all: allQuests?.length || 0,
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
        <div className="grid gap-4">
          {filteredQuests.map((userQuest) => (
            <QuestProgressCard key={userQuest.id} userQuest={userQuest} />
          ))}
        </div>
      )}
    </div>
  )
}
