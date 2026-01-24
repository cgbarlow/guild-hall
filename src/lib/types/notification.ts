/**
 * Notification type definitions for Guild Hall
 */

/**
 * All supported notification types
 */
export const NOTIFICATION_TYPES = {
  // User notifications from GM actions
  EVIDENCE_APPROVED: 'evidence_approved',
  EVIDENCE_REJECTED: 'evidence_rejected',
  EXTENSION_APPROVED: 'extension_approved',
  EXTENSION_DENIED: 'extension_denied',
  QUEST_COMPLETED: 'quest_completed',
  ACHIEVEMENT_UNLOCKED: 'achievement_unlocked',
  DEADLINE_APPROACHING: 'deadline_approaching',

  // GM notifications from user actions
  QUEST_ACCEPTED: 'quest_accepted',
  EVIDENCE_SUBMITTED: 'evidence_submitted',
  EXTENSION_REQUESTED: 'extension_requested',
  QUEST_ABANDONED: 'quest_abandoned',
} as const

export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES]

/**
 * Reference types for linking notifications to related entities
 */
export const REFERENCE_TYPES = {
  QUEST: 'quest',
  USER_QUEST: 'user_quest',
  USER_OBJECTIVE: 'user_objective',
  ACHIEVEMENT: 'achievement',
} as const

export type ReferenceType = typeof REFERENCE_TYPES[keyof typeof REFERENCE_TYPES]

/**
 * Notification with typed properties
 */
export interface TypedNotification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string | null
  reference_type: ReferenceType | null
  reference_id: string | null
  read: boolean
  read_at: string | null
  created_at: string
}

const GM_NOTIFICATION_TYPES: string[] = [
  NOTIFICATION_TYPES.QUEST_ACCEPTED,
  NOTIFICATION_TYPES.EVIDENCE_SUBMITTED,
  NOTIFICATION_TYPES.EXTENSION_REQUESTED,
  NOTIFICATION_TYPES.QUEST_ABANDONED,
]

const USER_NOTIFICATION_TYPES: string[] = [
  NOTIFICATION_TYPES.EVIDENCE_APPROVED,
  NOTIFICATION_TYPES.EVIDENCE_REJECTED,
  NOTIFICATION_TYPES.EXTENSION_APPROVED,
  NOTIFICATION_TYPES.EXTENSION_DENIED,
  NOTIFICATION_TYPES.QUEST_COMPLETED,
  NOTIFICATION_TYPES.ACHIEVEMENT_UNLOCKED,
  NOTIFICATION_TYPES.DEADLINE_APPROACHING,
]

/**
 * Check if a notification type is for GMs
 */
export function isGMNotificationType(type: string): boolean {
  return GM_NOTIFICATION_TYPES.includes(type)
}

/**
 * Check if a notification type is for regular users
 */
export function isUserNotificationType(type: string): boolean {
  return USER_NOTIFICATION_TYPES.includes(type)
}

/**
 * Get the link path for a notification based on its type and reference
 */
export function getNotificationLink(notification: {
  type: string
  reference_type: string | null
  reference_id: string | null
}): string | null {
  const { type, reference_type, reference_id } = notification

  if (!reference_id) return null

  // GM notifications link to review pages
  if (isGMNotificationType(type)) {
    if (type === NOTIFICATION_TYPES.EVIDENCE_SUBMITTED) {
      return '/gm/review'
    }
    if (type === NOTIFICATION_TYPES.EXTENSION_REQUESTED) {
      return '/gm/extensions'
    }
    return '/gm'
  }

  // User notifications link to their quests
  if (reference_type === REFERENCE_TYPES.USER_QUEST) {
    return `/my-quests/${reference_id}`
  }

  if (reference_type === REFERENCE_TYPES.QUEST) {
    return `/quests/${reference_id}`
  }

  if (reference_type === REFERENCE_TYPES.ACHIEVEMENT) {
    return '/dashboard'
  }

  return null
}
