'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Swords } from 'lucide-react'
import { AcceptQuestModal } from './accept-quest-modal'
import type { Quest } from '@/lib/types/quest'

interface AcceptQuestButtonProps {
  questId: string
  quest?: Quest
  onAccept?: (questId: string) => Promise<void>
  onAccepted?: () => void
  disabled?: boolean
  className?: string
  useModal?: boolean
}

export function AcceptQuestButton({
  questId,
  quest,
  onAccept,
  onAccepted,
  disabled,
  className,
  useModal = false,
}: AcceptQuestButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  // If modal mode is enabled and quest data is provided, use modal
  if (useModal && quest) {
    return (
      <AcceptQuestModal
        quest={quest}
        onAccepted={onAccepted}
        disabled={disabled}
        trigger={
          <Button size="lg" disabled={disabled} className={className}>
            <Swords className="h-4 w-4 mr-2" />
            Accept Quest
          </Button>
        }
      />
    )
  }

  // Fallback to legacy behavior without modal
  const handleAccept = async () => {
    if (!onAccept || disabled || isLoading) return

    setIsLoading(true)
    try {
      await onAccept(questId)
      onAccepted?.()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleAccept}
      disabled={disabled || isLoading}
      className={className}
      size="lg"
    >
      {isLoading ? (
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
    </Button>
  )
}
