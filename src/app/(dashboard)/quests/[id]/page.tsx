'use client'

import { useParams, useRouter } from 'next/navigation'
import { QuestDetail } from '@/components/quests/quest-detail'
import { useQuest } from '@/lib/hooks/use-quest'
import { useAcceptQuest } from '@/lib/hooks/use-accept-quest'
import { Loader2 } from 'lucide-react'

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-32 bg-muted rounded animate-pulse" />
      <div className="rounded-lg border bg-card p-6 space-y-6 animate-pulse">
        <div className="space-y-4">
          <div className="h-4 w-20 bg-muted rounded" />
          <div className="h-8 w-3/4 bg-muted rounded" />
          <div className="h-4 w-48 bg-muted rounded" />
        </div>
        <div className="flex gap-6">
          <div className="h-16 w-24 bg-muted rounded" />
          <div className="h-16 w-24 bg-muted rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-6 w-32 bg-muted rounded" />
          <div className="h-20 w-full bg-muted rounded" />
        </div>
      </div>
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
      <h2 className="text-lg font-semibold text-destructive mb-2">
        Quest Not Found
      </h2>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}

export default function QuestDetailPage() {
  const params = useParams()
  const router = useRouter()
  const questId = params.id as string

  const { data: quest, isLoading, error } = useQuest(questId)
  const acceptQuestMutation = useAcceptQuest({
    onSuccess: () => {
      // Refresh the page to show updated status
      router.refresh()
    },
    onError: (error) => {
      console.error('Failed to accept quest:', error)
    }
  })

  const handleAcceptQuest = async (id: string) => {
    await acceptQuestMutation.mutateAsync(id)
  }

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (error) {
    return <ErrorState message="This quest could not be loaded. It may have been removed." />
  }

  if (!quest) {
    return <ErrorState message="This quest does not exist." />
  }

  // Quest is available if it's published and user hasn't already accepted it
  const canAccept = quest.status === 'published'

  return (
    <QuestDetail
      quest={quest}
      onAccept={handleAcceptQuest}
      canAccept={canAccept}
    />
  )
}
