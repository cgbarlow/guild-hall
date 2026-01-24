'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Swords } from 'lucide-react'

interface AcceptQuestButtonProps {
  questId: string
  onAccept?: (questId: string) => Promise<void>
  disabled?: boolean
  className?: string
}

export function AcceptQuestButton({
  questId,
  onAccept,
  disabled,
  className,
}: AcceptQuestButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleAccept = async () => {
    if (!onAccept || disabled || isLoading) return

    setIsLoading(true)
    try {
      await onAccept(questId)
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
          <Loader2 className="h-4 w-4 animate-spin" />
          Accepting...
        </>
      ) : (
        <>
          <Swords className="h-4 w-4" />
          Accept Quest
        </>
      )}
    </Button>
  )
}
