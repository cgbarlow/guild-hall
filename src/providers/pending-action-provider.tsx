'use client'

import { useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useAcceptQuest } from '@/lib/hooks/use-accept-quest'
import {
  getPendingAction,
  clearPendingAction,
  isExpired,
} from '@/lib/auth/pending-action'

interface PendingActionProviderProps {
  children: React.ReactNode
}

/**
 * Provider that executes pending actions after user authentication.
 *
 * When a user attempts a protected action while unauthenticated,
 * the action is stored. After they log in, this provider retrieves
 * and executes the pending action.
 */
export function PendingActionProvider({
  children,
}: PendingActionProviderProps) {
  const { user } = useAuth()
  const { mutate: acceptQuest } = useAcceptQuest()
  const hasExecuted = useRef(false)

  useEffect(() => {
    // Only execute once per session and only when user is authenticated
    if (!user || hasExecuted.current) return

    const pending = getPendingAction()

    // No pending action or expired
    if (!pending || isExpired(pending)) {
      clearPendingAction()
      return
    }

    // Mark as executed to prevent re-running
    hasExecuted.current = true

    // Execute the pending action based on type
    switch (pending.type) {
      case 'accept_quest': {
        const questId = pending.payload.questId as string
        if (questId) {
          acceptQuest({ questId })
        }
        break
      }
      case 'submit_evidence': {
        // Submit evidence requires more complex handling (form data)
        // For now, we just clear the pending action and let the user
        // navigate back to the page to submit manually
        // This can be enhanced in the future
        break
      }
    }

    // Clear the pending action after execution
    clearPendingAction()
  }, [user, acceptQuest])

  return <>{children}</>
}
