'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, XCircle } from 'lucide-react'
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
import { useAbandonQuest } from '@/lib/hooks/use-abandon-quest'

interface AbandonQuestButtonProps {
  userQuestId: string
  questTitle: string
  disabled?: boolean
}

export function AbandonQuestButton({
  userQuestId,
  questTitle,
  disabled,
}: AbandonQuestButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const { mutate: abandonQuest, isPending, error } = useAbandonQuest({
    onSuccess: () => {
      setOpen(false)
      router.push('/my-quests')
    },
  })

  const handleAbandon = () => {
    abandonQuest(userQuestId)
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" disabled={disabled} className="text-muted-foreground hover:text-destructive">
          <XCircle className="h-4 w-4 mr-2" />
          Abandon Quest
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Abandon Quest?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to abandon &quot;{questTitle}&quot;? You can accept this quest again later if you change your mind.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
            {error.message}
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleAbandon}
            disabled={isPending}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Abandoning...
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 mr-2" />
                Abandon Quest
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
