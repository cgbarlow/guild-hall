'use client'

import { useState } from 'react'
import { Trophy, CheckCircle2, XCircle, Loader2, Clock, User } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useReviewQuestCompletion } from '@/lib/hooks/use-quest-approvals'
import type { PendingQuestApproval } from '@/lib/actions/quest-completion'

interface QuestApprovalCardProps {
  approval: PendingQuestApproval
  onReviewed?: () => void
}

function formatDate(dateString: string | null): string {
  if (!dateString) return 'Unknown'
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function QuestApprovalCard({ approval, onReviewed }: QuestApprovalCardProps) {
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [reviewResult, setReviewResult] = useState<'approved' | 'rejected' | null>(null)

  const reviewMutation = useReviewQuestCompletion()

  const handleApprove = async () => {
    setShowApproveDialog(false)

    const result = await reviewMutation.mutateAsync({
      userQuestId: approval.id,
      approved: true,
      feedback: feedback || undefined,
    })

    if (result.success) {
      setReviewResult('approved')
      onReviewed?.()
    }
  }

  const handleReject = async () => {
    setShowRejectDialog(false)

    const result = await reviewMutation.mutateAsync({
      userQuestId: approval.id,
      approved: false,
      feedback: feedback || undefined,
    })

    if (result.success) {
      setReviewResult('rejected')
      onReviewed?.()
    }
  }

  if (reviewResult === 'approved') {
    return (
      <Card className="border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/20">
        <CardContent className="py-6 text-center">
          <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <p className="font-medium text-green-700 dark:text-green-400">
            Quest Approved - {approval.quest_points} pts awarded
          </p>
        </CardContent>
      </Card>
    )
  }

  if (reviewResult === 'rejected') {
    return (
      <Card className="border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/20">
        <CardContent className="py-6 text-center">
          <XCircle className="h-8 w-8 text-amber-600 mx-auto mb-2" />
          <p className="font-medium text-amber-700 dark:text-amber-400">
            Quest Returned for Revision
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Trophy className="h-4 w-4 text-amber-500" />
                Quest Completion
              </div>
              <CardTitle className="text-lg">{approval.quest_title}</CardTitle>
            </div>
            <div className="text-right">
              <span className="text-lg font-semibold text-amber-600">
                {approval.quest_points} pts
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              {approval.user_display_name || approval.user_email}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Submitted {formatDate(approval.ready_to_claim_at)}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => setShowApproveDialog(true)}
              disabled={reviewMutation.isPending}
              className="flex-1"
            >
              {reviewMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-2 h-4 w-4" />
              )}
              Approve
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowRejectDialog(true)}
              disabled={reviewMutation.isPending}
              className="flex-1"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Return for Revision
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Approve Dialog */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Quest Completion?</AlertDialogTitle>
            <AlertDialogDescription>
              This will complete the quest and award{' '}
              <strong>{approval.quest_points} points</strong> to{' '}
              {approval.user_display_name || approval.user_email}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label htmlFor="approve-feedback">Feedback (optional)</Label>
            <Textarea
              id="approve-feedback"
              placeholder="Add congratulations or feedback..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleApprove}>
              Approve & Award Points
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Return Quest for Revision?</AlertDialogTitle>
            <AlertDialogDescription>
              This will return the quest to {approval.user_display_name || approval.user_email}.
              They can review your feedback and submit again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reject-feedback">Feedback (recommended)</Label>
            <Textarea
              id="reject-feedback"
              placeholder="Explain what needs to be improved..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReject}>
              Return for Revision
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
