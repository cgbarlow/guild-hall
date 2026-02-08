/**
 * Pending Action Storage Utilities
 *
 * Handles storing and retrieving pending actions that should be
 * executed after authentication.
 */

const STORAGE_KEY = 'guild-hall-pending-action'
const MAX_AGE_MS = 10 * 60 * 1000 // 10 minutes

export type PendingActionType = 'accept_quest' | 'submit_evidence'

export interface PendingAction {
  type: PendingActionType
  payload: Record<string, unknown>
  returnUrl: string
  timestamp: number
}

/**
 * Store a pending action in sessionStorage
 */
export function storePendingAction(
  action: Omit<PendingAction, 'timestamp'>
): void {
  if (typeof window === 'undefined') return

  const pendingAction: PendingAction = {
    ...action,
    timestamp: Date.now(),
  }

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(pendingAction))
  } catch {
    // sessionStorage might be full or disabled
    console.warn('Failed to store pending action')
  }
}

/**
 * Retrieve the pending action from sessionStorage
 * Returns null if no action exists or if it has expired
 */
export function getPendingAction(): PendingAction | null {
  if (typeof window === 'undefined') return null

  try {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    if (!stored) return null

    const action = JSON.parse(stored) as PendingAction

    // Check if expired
    if (isExpired(action)) {
      clearPendingAction()
      return null
    }

    return action
  } catch {
    // Invalid JSON or other error
    clearPendingAction()
    return null
  }
}

/**
 * Clear the pending action from sessionStorage
 */
export function clearPendingAction(): void {
  if (typeof window === 'undefined') return

  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // Ignore errors
  }
}

/**
 * Check if a pending action has expired
 */
export function isExpired(action: PendingAction): boolean {
  return Date.now() - action.timestamp > MAX_AGE_MS
}

/**
 * Validate that a returnUrl is safe (relative path only)
 */
export function validateReturnUrl(url: string | null): string {
  if (!url || !url.startsWith('/')) {
    return '/dashboard'
  }
  return url
}
