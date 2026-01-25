'use client'

import { useState } from 'react'
import { Trophy, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import { useClaimQuest } from '@/lib/hooks/use-claim-quest'

interface ClaimRewardButtonProps {
  userQuestId: string
  questTitle: string
  points: number
  requiresApproval?: boolean
  className?: string
}

export function ClaimRewardButton({
  userQuestId,
  questTitle,
  points,
  requiresApproval = false,
  className,
}: ClaimRewardButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [result, setResult] = useState<{
    status: 'idle' | 'success' | 'pending_approval' | 'error'
    message?: string
    pointsAwarded?: number
  }>({ status: 'idle' })

  const claimQuest = useClaimQuest()

  const handleClaim = async () => {
    setShowConfirm(false)

    const claimResult = await claimQuest.mutateAsync(userQuestId)

    if (claimResult.success) {
      if (claimResult.status === 'completed') {
        setResult({
          status: 'success',
          pointsAwarded: claimResult.pointsAwarded,
        })
      } else if (claimResult.status === 'awaiting_final_approval') {
        setResult({ status: 'pending_approval' })
      }
    } else {
      setResult({
        status: 'error',
        message: claimResult.error || 'Failed to claim reward',
      })
    }
  }

  if (result.status === 'success') {
    return (
      <div className="flex items-center gap-2 text-green-600 font-medium">
        <CheckCircle2 className="h-5 w-5" />
        <span>Quest Completed! +{result.pointsAwarded} pts</span>
      </div>
    )
  }

  if (result.status === 'pending_approval') {
    return (
      <div className="flex items-center gap-2 text-amber-600 font-medium">
        <CheckCircle2 className="h-5 w-5" />
        <span>Submitted for GM Approval</span>
      </div>
    )
  }

  if (result.status === 'error') {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-destructive text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{result.message}</span>
        </div>
        <Button
          onClick={() => setShowConfirm(true)}
          variant="outline"
          size="sm"
        >
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <>
      <Button
        onClick={() => setShowConfirm(true)}
        disabled={claimQuest.isPending}
        className={className}
      >
        {claimQuest.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Claiming...
          </>
        ) : (
          <>
            <Trophy className="mr-2 h-4 w-4" />
            Claim Reward ({points} pts)
          </>
        )}
      </Button>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {requiresApproval ? 'Submit for Approval?' : 'Claim Reward?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {requiresApproval ? (
                <>
                  You have completed all objectives for &ldquo;{questTitle}&rdquo;.
                  This quest requires GM approval before you receive your reward.
                  <br /><br />
                  <strong>Reward: {points} points</strong>
                </>
              ) : (
                <>
                  Congratulations! You have completed all objectives for &ldquo;{questTitle}&rdquo;.
                  <br /><br />
                  <strong>You will receive: {points} points</strong>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClaim}>
              {requiresApproval ? 'Submit for Approval' : 'Claim Reward'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
