'use client'

import { useState } from 'react'
import { Check, X, AlertCircle, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { approveExtensionAction, denyExtensionAction } from '@/lib/actions/gm/extension'
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

interface ExtensionActionsProps {
  userQuestId: string
  currentDeadline: string | null
  completionDays: number
  onApprove?: () => void
  onDeny?: () => void
}

function getDefaultNewDeadline(currentDeadline: string | null, additionalDays: number): string {
  const baseDate = currentDeadline ? new Date(currentDeadline) : new Date()
  const newDate = new Date(baseDate)
  newDate.setDate(newDate.getDate() + additionalDays)
  return newDate.toISOString().split('T')[0]
}

export function ExtensionActions({
  userQuestId,
  currentDeadline,
  completionDays,
  onApprove,
  onDeny,
}: ExtensionActionsProps) {
  const queryClient = useQueryClient()
  const [showApproveForm, setShowApproveForm] = useState(false)
  const [showDenyDialog, setShowDenyDialog] = useState(false)
  const [newDeadline, setNewDeadline] = useState(
    getDefaultNewDeadline(currentDeadline, Math.ceil(completionDays / 2))
  )
  const [error, setError] = useState<string | null>(null)

  const approveMutation = useMutation({
    mutationFn: (deadline: string) => approveExtensionAction(userQuestId, deadline),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['extensionRequests'] })
        setShowApproveForm(false)
        onApprove?.()
      } else {
        setError(result.error || 'Failed to approve extension')
      }
    },
    onError: (err: Error) => {
      setError(err.message)
    },
  })

  const denyMutation = useMutation({
    mutationFn: () => denyExtensionAction(userQuestId),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['extensionRequests'] })
        setShowDenyDialog(false)
        onDeny?.()
      } else {
        setError(result.error || 'Failed to deny extension')
      }
    },
    onError: (err: Error) => {
      setError(err.message)
    },
  })

  const handleApprove = () => {
    setError(null)
    approveMutation.mutate(newDeadline)
  }

  const handleDeny = () => {
    setError(null)
    denyMutation.mutate()
  }

  const isPending = approveMutation.isPending || denyMutation.isPending
  const minDate = new Date().toISOString().split('T')[0]

  if (showApproveForm) {
    return (
      <div className="space-y-4 pt-2 border-t">
        <div className="space-y-2">
          <Label htmlFor="new-deadline" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            New Deadline
          </Label>
          <Input
            id="new-deadline"
            type="date"
            value={newDeadline}
            onChange={(e) => setNewDeadline(e.target.value)}
            min={minDate}
            disabled={isPending}
          />
          <p className="text-xs text-muted-foreground">
            Select a new deadline for the quest completion.
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-destructive/10 p-2 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
            <p className="text-xs text-destructive">{error}</p>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setShowApproveForm(false)
              setError(null)
            }}
            disabled={isPending}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleApprove}
            disabled={isPending || !newDeadline}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {approveMutation.isPending ? 'Approving...' : 'Approve Extension'}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      {error && (
        <div className="rounded-md bg-destructive/10 p-2 flex items-start gap-2 mb-2">
          <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
          <p className="text-xs text-destructive">{error}</p>
        </div>
      )}

      <div className="flex items-center gap-2 pt-2 border-t">
        <Button
          size="sm"
          onClick={() => setShowApproveForm(true)}
          disabled={isPending}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          <Check className="mr-1 h-4 w-4" />
          Approve
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setShowDenyDialog(true)}
          disabled={isPending}
          className="flex-1"
        >
          <X className="mr-1 h-4 w-4" />
          Deny
        </Button>
      </div>

      <AlertDialog open={showDenyDialog} onOpenChange={setShowDenyDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deny Extension Request?</AlertDialogTitle>
            <AlertDialogDescription>
              This will deny the extension request. The user will need to complete the
              quest by the original deadline or it may expire.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={denyMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeny}
              disabled={denyMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {denyMutation.isPending ? 'Denying...' : 'Deny Extension'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
