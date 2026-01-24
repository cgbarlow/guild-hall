'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ClipboardCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EvidenceViewer } from '@/components/gm/review/evidence-viewer'
import { UserContext } from '@/components/gm/review/user-context'
import { QuestContext } from '@/components/gm/review/quest-context'
import { useSubmission, useObjectiveCounts } from '@/lib/hooks/use-submission'

function ReviewDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-8 w-48" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    </div>
  )
}

export default function ReviewDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const { data: submission, isLoading, error } = useSubmission(id)
  const { data: counts } = useObjectiveCounts(submission?.user_quest_id)

  if (isLoading) {
    return <ReviewDetailSkeleton />
  }

  if (error || !submission) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/gm/review">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Queue
          </Link>
        </Button>
        <div className="text-center py-12">
          <p className="text-destructive mb-4">
            {error ? 'Failed to load submission.' : 'Submission not found.'}
          </p>
          <Button variant="outline" onClick={() => router.push('/gm/review')}>
            Return to Review Queue
          </Button>
        </div>
      </div>
    )
  }

  const user = submission.user_quest.user
  const quest = submission.user_quest.quest
  const objective = submission.objective

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/gm/review">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Queue
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardCheck className="h-6 w-6" />
            Review Submission
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Evidence (Main Column) */}
        <div className="lg:col-span-2 space-y-6">
          <EvidenceViewer
            evidenceText={submission.evidence_text}
            evidenceUrl={submission.evidence_url}
            evidenceType={objective?.evidence_type}
            submittedAt={submission.submitted_at}
          />

          {/* Review Actions Placeholder - Will be implemented in 6.3 */}
          <div className="rounded-lg border bg-muted/30 p-6 text-center">
            <p className="text-muted-foreground">
              Review actions will be available here.
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <UserContext
            user={user ? {
              id: user.id,
              display_name: user.display_name,
              email: user.email,
              total_points: user.total_points,
              avatar_url: user.avatar_url,
            } : null}
          />
          <QuestContext
            quest={quest ? {
              id: quest.id,
              title: quest.title,
              points: quest.points,
              description: quest.description,
              completion_days: quest.completion_days,
            } : null}
            objective={objective ? {
              id: objective.id,
              title: objective.title,
              description: objective.description,
              points: objective.points,
              evidence_type: objective.evidence_type,
              display_order: objective.display_order,
            } : null}
            totalObjectives={counts?.total ?? 0}
            completedObjectives={counts?.completed ?? 0}
          />
        </div>
      </div>
    </div>
  )
}
