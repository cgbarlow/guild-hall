'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EvidenceForm } from '@/components/my-quests/evidence-form'
import { useUserQuests } from '@/lib/hooks/use-user-quests'
import { useUserObjectives } from '@/lib/hooks/use-user-objectives'

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-32" />
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-10 w-24" />
        </CardContent>
      </Card>
    </div>
  )
}

function ErrorState({ message, backUrl }: { message: string; backUrl: string }) {
  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild className="gap-2">
        <Link href={backUrl}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </Button>
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
        <h2 className="text-lg font-semibold text-destructive mb-2">Error</h2>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}

export default function SubmitEvidencePage() {
  const params = useParams()
  const router = useRouter()
  const userQuestId = params.id as string
  const objectiveId = params.objectiveId as string

  // Fetch user quests to get quest details
  const { data: userQuests, isLoading: questsLoading, error: questsError } = useUserQuests()
  const userQuest = userQuests?.find((uq) => uq.id === userQuestId)

  // Fetch objectives
  const { data: objectives, isLoading: objectivesLoading } = useUserObjectives(
    userQuest ? userQuestId : undefined
  )

  // Find the specific objective
  const userObjective = objectives?.find((o) => o.objective_id === objectiveId)

  const isLoading = questsLoading || objectivesLoading
  const backUrl = `/my-quests/${userQuestId}`

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (questsError) {
    return <ErrorState message="Failed to load quest. Please try again." backUrl="/my-quests" />
  }

  if (!userQuest) {
    return <ErrorState message="Quest not found." backUrl="/my-quests" />
  }

  if (!userObjective) {
    return <ErrorState message="Objective not found." backUrl={backUrl} />
  }

  const objective = userObjective.objective
  if (!objective) {
    return <ErrorState message="Objective details not found." backUrl={backUrl} />
  }

  // Check if evidence can be submitted
  if (userObjective.status === 'locked') {
    return <ErrorState message="This objective is locked. Complete the prerequisite first." backUrl={backUrl} />
  }

  if (userObjective.status === 'approved') {
    return <ErrorState message="This objective has already been approved." backUrl={backUrl} />
  }

  if (userObjective.status === 'submitted') {
    return <ErrorState message="Evidence has already been submitted and is pending review." backUrl={backUrl} />
  }

  const handleSuccess = () => {
    router.push(backUrl)
  }

  const handleCancel = () => {
    router.push(backUrl)
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" asChild className="gap-2">
        <Link href={backUrl}>
          <ArrowLeft className="h-4 w-4" />
          Back to Quest
        </Link>
      </Button>

      {/* Quest context */}
      <div>
        <h1 className="text-2xl font-bold">{userQuest.quest?.title}</h1>
        <p className="text-muted-foreground">Submit evidence for objective completion</p>
      </div>

      {/* Evidence submission card */}
      <Card>
        <CardHeader>
          <CardTitle>{objective.title}</CardTitle>
          {objective.description && (
            <CardDescription>{objective.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <EvidenceForm
            userObjectiveId={userObjective.id}
            evidenceType={objective.evidence_type}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </CardContent>
      </Card>
    </div>
  )
}
