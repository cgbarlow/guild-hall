'use client'

import { useCallback, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import {
  storePendingAction,
  type PendingAction,
} from '@/lib/auth/pending-action'

interface UseRequireAuthOptions {
  /** Override the return URL (defaults to current pathname) */
  returnUrl?: string
}

interface UseRequireAuthResult {
  /** The current user (null if not authenticated) */
  user: ReturnType<typeof useAuth>['user']
  /** Whether the user is authenticated */
  isAuthenticated: boolean
  /** Whether auth state is still loading */
  isLoading: boolean
  /** Whether the auth modal should be shown */
  showModal: boolean
  /** Set the modal visibility */
  setShowModal: (show: boolean) => void
  /** The return URL to use for auth redirects */
  returnUrl: string
  /**
   * Execute an action if authenticated, or show auth modal if not.
   * Optionally stores a pending action to be executed after login.
   */
  requireAuth: <T>(
    action: () => Promise<T>,
    pendingAction?: Omit<PendingAction, 'timestamp' | 'returnUrl'>
  ) => Promise<T | null>
}

/**
 * Hook for handling auth-gated actions.
 *
 * When an unauthenticated user attempts a protected action, this hook
 * shows an auth modal and optionally stores the pending action to be
 * executed after login.
 *
 * @example
 * ```tsx
 * const { user, requireAuth, showModal, setShowModal, returnUrl } = useRequireAuth()
 *
 * const handleAcceptQuest = async () => {
 *   await requireAuth(
 *     () => acceptQuest(questId),
 *     { type: 'accept_quest', payload: { questId } }
 *   )
 * }
 * ```
 */
export function useRequireAuth(
  options?: UseRequireAuthOptions
): UseRequireAuthResult {
  const { user, isLoading } = useAuth()
  const pathname = usePathname()
  const [showModal, setShowModal] = useState(false)

  const returnUrl = options?.returnUrl ?? pathname

  const requireAuth = useCallback(
    async <T>(
      action: () => Promise<T>,
      pendingAction?: Omit<PendingAction, 'timestamp' | 'returnUrl'>
    ): Promise<T | null> => {
      if (!user) {
        // Store pending action if provided
        if (pendingAction) {
          storePendingAction({
            ...pendingAction,
            returnUrl,
          })
        }
        setShowModal(true)
        return null
      }

      return action()
    },
    [user, returnUrl]
  )

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    showModal,
    setShowModal,
    returnUrl,
    requireAuth,
  }
}
