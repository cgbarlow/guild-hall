'use client'

import { useParams } from 'next/navigation'
import { notFound } from 'next/navigation'
import { useQuest } from '@/lib/hooks/use-quest'
import { QuestEditForm } from '@/components/gm/quest-edit-form'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

function QuestEditSkeleton() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    </div>
  )
}

export default function QuestEditPage() {
  const params = useParams<{ id: string }>()
  const id = params.id
  const { data: quest, isLoading, error } = useQuest(id)

  if (isLoading) {
    return <QuestEditSkeleton />
  }

  if (error || !quest) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-3xl">
      <QuestEditForm quest={quest} />
    </div>
  )
}
