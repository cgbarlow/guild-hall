'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Award, Clock, Calendar, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ProgressBar, ObjectiveChecklist } from '@/components/my-quests'
import { ClaimRewardButton } from '@/components/my-quests/claim-reward-button'
import { useUserQuests, getUserQuestStatusInfo } from '@/lib/hooks/use-user-quests'
import { useUserObjectives } from '@/lib/hooks/use-user-objectives'
import { cn } from '@/lib/utils'

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
    <div className="space-y-6">
      <Button variant="ghost" asChild className="gap-2">
        <Link href="/my-quests">
          <ArrowLeft className="h-4 w-4" />
          Back to My Quests
        </Link>
      </Button>
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
        <h2 className="text-lg font-semibold text-destructive mb-2">
          Quest Not Found
        </h2>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}

function formatDate(dateString: string | null): string {
  if (!dateString) return 'No deadline'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function getDaysRemaining(deadline: string | null): number | null {
  if (!deadline) return null
  const now = new Date()
  const deadlineDate = new Date(deadline)
  const diffTime = deadlineDate.getTime() - now.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export default function QuestProgressPage() {
  const params = useParams()
  const router = useRouter()
  const userQuestId = params.id as string

  // Fetch user quests to find the specific one
  const { data: userQuests, isLoading: questsLoading, error: questsError } = useUserQuests()

  // Find the specific user quest
  const userQuest = userQuests?.find((uq) => uq.id === userQuestId)

  // Fetch objectives for this user quest
  const { data: objectives, isLoading: objectivesLoading } = useUserObjectives(
    userQuest ? userQuestId : undefined
  )

  const isLoading = questsLoading || objectivesLoading

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (questsError) {
    return <ErrorState message="Failed to load quest. Please try again." />
  }

  if (!userQuest) {
    return <ErrorState message="This quest could not be found." />
  }

  const statusInfo = getUserQuestStatusInfo(userQuest.status)
  const deadline = userQuest.extended_deadline || userQuest.deadline
  const daysRemaining = getDaysRemaining(deadline)
  const isOverdue = daysRemaining !== null && daysRemaining < 0
  const isUrgent = daysRemaining !== null && daysRemaining >= 0 && daysRemaining <= 3

  // Calculate progress
  const completedObjectives = objectives?.filter((o) => o.status === 'approved').length || 0
  const totalObjectives = objectives?.length || 0
  const progressPercentage = totalObjectives > 0
    ? Math.round((completedObjectives / totalObjectives) * 100)
    : 0

  const isReadyToClaim = userQuest.status === 'ready_to_claim'
  const isAwaitingApproval = userQuest.status === 'awaiting_final_approval'
  const isCompleted = userQuest.status === 'completed'

  const handleSubmitEvidence = (objectiveId: string) => {
    // Navigate to evidence submission - to be implemented in Phase 4.4
    router.push(`/my-quests/${userQuestId}/evidence/${objectiveId}`)
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" asChild className="gap-2">
        <Link href="/my-quests">
          <ArrowLeft className="h-4 w-4" />
          Back to My Quests
        </Link>
      </Button>

      {/* Main quest card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white',
                    statusInfo.color
                  )}
                >
                  {statusInfo.label}
                </span>
                {userQuest.extension_requested && !userQuest.extension_granted && (
                  <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                    Extension Requested
                  </span>
                )}
                {userQuest.extension_granted && (
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                    Extension Granted
                  </span>
                )}
              </div>
              <CardTitle className="text-2xl sm:text-3xl">
                {userQuest.quest?.title || 'Untitled Quest'}
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Accepted on {formatDate(userQuest.accepted_at)}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Progress Overview */}
          {totalObjectives > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Progress</h3>
                <span className="text-sm text-muted-foreground">
                  {completedObjectives} / {totalObjectives} objectives
                </span>
              </div>
              <ProgressBar value={progressPercentage} size="lg" />
            </div>
          )}

          {/* Quest stats */}
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              <div>
                <p className="text-sm text-muted-foreground">Reward</p>
                <p className="text-lg font-semibold">{userQuest.quest?.points || 0} pts</p>
              </div>
            </div>
            {deadline && (
              <div className="flex items-center gap-2">
                {isOverdue ? (
                  <AlertCircle className="h-5 w-5 text-destructive" />
                ) : (
                  <Clock className={cn('h-5 w-5', isUrgent ? 'text-amber-500' : 'text-blue-500')} />
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Deadline</p>
                  <p
                    className={cn(
                      'text-lg font-semibold',
                      isOverdue && 'text-destructive',
                      isUrgent && !isOverdue && 'text-amber-500'
                    )}
                  >
                    {isOverdue
                      ? `${Math.abs(daysRemaining!)} days overdue`
                      : daysRemaining === 0
                      ? 'Due today'
                      : `${daysRemaining} days left`}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {userQuest.quest?.description && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {userQuest.quest.description}
              </p>
            </div>
          )}

          {/* Objectives */}
          {objectives && objectives.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Objectives</h3>
              <ObjectiveChecklist
                objectives={objectives}
                onSubmitEvidence={handleSubmitEvidence}
              />
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 border-t flex flex-wrap gap-3">
            {isReadyToClaim && (
              <ClaimRewardButton
                userQuestId={userQuestId}
                questTitle={userQuest.quest?.title || 'Quest'}
                points={userQuest.quest?.points || 0}
                requiresApproval={userQuest.quest?.requires_final_approval}
              />
            )}
            {isAwaitingApproval && (
              <div className="flex items-center gap-2 text-purple-600 font-medium">
                <Clock className="h-5 w-5" />
                <span>Awaiting GM final approval</span>
              </div>
            )}
            {isCompleted && (
              <div className="flex items-center gap-2 text-green-600 font-medium">
                <Award className="h-5 w-5" />
                <span>Quest completed! +{userQuest.quest?.points || 0} pts earned</span>
              </div>
            )}
            {userQuest.status === 'in_progress' && deadline && !userQuest.extension_requested && (
              <Button variant="outline" asChild>
                <Link href={`/my-quests/${userQuestId}/extension`}>
                  Request Extension
                </Link>
              </Button>
            )}
          </div>

          {/* Show final feedback if present */}
          {(userQuest as { final_feedback?: string }).final_feedback && (
            <div className="mt-4 p-4 rounded-lg bg-muted">
              <h4 className="font-medium mb-1">GM Feedback</h4>
              <p className="text-sm text-muted-foreground">
                {(userQuest as { final_feedback?: string }).final_feedback}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
