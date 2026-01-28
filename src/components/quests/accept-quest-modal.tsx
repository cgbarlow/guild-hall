'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Award, Clock, Swords, Lock } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAcceptQuest } from '@/lib/hooks/use-accept-quest'
import type { Quest } from '@/lib/types/quest'

interface AcceptQuestModalProps {
  quest: Quest
  onAccepted?: () => void
  trigger?: React.ReactNode
  disabled?: boolean
}

export function AcceptQuestModal({
  quest,
  onAccepted,
  trigger,
  disabled,
}: AcceptQuestModalProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [exclusiveCode, setExclusiveCode] = useState('')

  const { mutate: acceptQuest, isPending, error } = useAcceptQuest({
    onSuccess: (userQuest) => {
      setOpen(false)
      setExclusiveCode('')
      onAccepted?.()
      // Redirect to the user's quest page
      router.push(`/my-quests/${userQuest.id}`)
    },
  })

  const handleAccept = (e: React.MouseEvent) => {
    e.preventDefault()
    acceptQuest({
      questId: quest.id,
      exclusiveCode: quest.is_exclusive ? exclusiveCode : undefined,
    })
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      setExclusiveCode('')
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button size="lg" disabled={disabled}>
            <Swords className="h-4 w-4 mr-2" />
            Accept Quest
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {quest.is_exclusive && <Lock className="h-5 w-5 text-amber-500" />}
            Accept Quest
          </AlertDialogTitle>
          <AlertDialogDescription>
            {quest.is_exclusive
              ? 'This is an exclusive quest. Enter the unlock code to proceed.'
              : 'Are you ready to embark on this quest?'}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Quest Summary */}
        <div className="py-4 space-y-4">
          <div>
            <h4 className="font-semibold text-lg">{quest.title}</h4>
            {quest.short_description && (
              <p className="text-sm text-muted-foreground mt-1">
                {quest.short_description}
              </p>
            )}
          </div>

          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              <div>
                <p className="text-xs text-muted-foreground">Reward</p>
                <p className="font-semibold">{quest.points} pts</p>
              </div>
            </div>
            {quest.time_limit_days && (
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Time Limit</p>
                  <p className="font-semibold">{quest.time_limit_days} days</p>
                </div>
              </div>
            )}
          </div>

          {quest.objectives && quest.objectives.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Objectives:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                {quest.objectives.slice(0, 3).map((obj, idx) => (
                  <li key={obj.id} className="flex items-start gap-2">
                    <span className="text-muted-foreground">{idx + 1}.</span>
                    <span>{obj.description}</span>
                  </li>
                ))}
                {quest.objectives.length > 3 && (
                  <li className="text-muted-foreground italic">
                    +{quest.objectives.length - 3} more objectives
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Exclusive Quest Code Input */}
          {quest.is_exclusive && (
            <div className="space-y-2 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
              <Label htmlFor="exclusive-code" className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                <Lock className="h-4 w-4" />
                Unlock Code
              </Label>
              <Input
                id="exclusive-code"
                type="text"
                placeholder="Enter the secret code"
                value={exclusiveCode}
                onChange={(e) => setExclusiveCode(e.target.value)}
                className="font-mono"
                disabled={isPending}
              />
            </div>
          )}

          {error && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              {error.message}
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleAccept}
            disabled={isPending || (quest.is_exclusive && !exclusiveCode.trim())}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Accepting...
              </>
            ) : (
              <>
                <Swords className="h-4 w-4 mr-2" />
                Accept Quest
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
