'use client'

import { useState } from 'react'
import { Check, X, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FeedbackForm } from './feedback-form'
import { useReviewSubmission } from '@/lib/hooks/use-review-submission'
import { useRouter } from 'next/navigation'
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

interface ReviewActionsProps {
  userObjectiveId: string
  userName?: string
  objectiveTitle?: string
}

export function ReviewActions({
  userObjectiveId,
  userName,
  objectiveTitle,
}: ReviewActionsProps) {
  const router = useRouter()
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [approveFeedback, setApproveFeedback] = useState('')
  const [error, setError] = useState<string | null>(null)

  const { approveSubmission, rejectSubmission, isApproving, isRejecting, isPending } =
    useReviewSubmission({
      onSuccess: () => {
        router.push('/gm/review')
      },
      onError: (err) => {
        setError(err.message)
      },
    })

  const handleApprove = async () => {
    setError(null)
    try {
      await approveSubmission({
        userObjectiveId,
        feedback: approveFeedback || undefined,
      })
    } catch {
      // Error handled by onError callback
    }
  }

  const handleReject = async (feedback: string) => {
    setError(null)
    try {
      await rejectSubmission({
        userObjectiveId,
        feedback,
      })
    } catch {
      // Error handled by onError callback
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Review Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {showRejectForm ? (
          <FeedbackForm
            onSubmit={handleReject}
            onCancel={() => setShowRejectForm(false)}
            isLoading={isRejecting}
            title="Rejection Feedback"
            placeholder="Explain why this submission was rejected and what the user should do differently..."
            submitLabel="Reject Submission"
            minLength={10}
          />
        ) : (
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => setShowApproveDialog(true)}
              disabled={isPending}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <Check className="mr-2 h-4 w-4" />
              Approve Submission
            </Button>
            <Button
              variant="destructive"
              onClick={() => setShowRejectForm(true)}
              disabled={isPending}
              className="w-full"
            >
              <X className="mr-2 h-4 w-4" />
              Reject Submission
            </Button>
          </div>
        )}

        <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Approve Submission</AlertDialogTitle>
              <AlertDialogDescription>
                You are about to approve the submission
                {userName && ` from ${userName}`}
                {objectiveTitle && ` for "${objectiveTitle}"`}.
                This will award the objective points to the user.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <label className="text-sm font-medium mb-2 block">
                Feedback (Optional)
              </label>
              <textarea
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[80px]"
                placeholder="Add positive feedback or encouragement..."
                value={approveFeedback}
                onChange={(e) => setApproveFeedback(e.target.value)}
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isApproving}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleApprove}
                disabled={isApproving}
                className="bg-green-600 hover:bg-green-700"
              >
                {isApproving ? 'Approving...' : 'Approve'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}
