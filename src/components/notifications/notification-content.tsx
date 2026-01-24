'use client'

import {
  CheckCircle,
  XCircle,
  Clock,
  Trophy,
  Target,
  FileCheck,
  AlertCircle,
  Bell,
  type LucideIcon,
} from 'lucide-react'
import { NOTIFICATION_TYPES } from '@/lib/types/notification'

/**
 * Get the icon component for a notification type
 */
export function getNotificationIcon(type: string): LucideIcon {
  switch (type) {
    case NOTIFICATION_TYPES.EVIDENCE_APPROVED:
      return CheckCircle
    case NOTIFICATION_TYPES.EVIDENCE_REJECTED:
      return XCircle
    case NOTIFICATION_TYPES.EXTENSION_APPROVED:
      return Clock
    case NOTIFICATION_TYPES.EXTENSION_DENIED:
      return XCircle
    case NOTIFICATION_TYPES.QUEST_COMPLETED:
      return Trophy
    case NOTIFICATION_TYPES.ACHIEVEMENT_UNLOCKED:
      return Trophy
    case NOTIFICATION_TYPES.DEADLINE_APPROACHING:
      return AlertCircle
    case NOTIFICATION_TYPES.QUEST_ACCEPTED:
      return Target
    case NOTIFICATION_TYPES.EVIDENCE_SUBMITTED:
      return FileCheck
    case NOTIFICATION_TYPES.EXTENSION_REQUESTED:
      return Clock
    case NOTIFICATION_TYPES.QUEST_ABANDONED:
      return XCircle
    default:
      return Bell
  }
}

/**
 * Get the color class for a notification type
 */
export function getNotificationColor(type: string): string {
  switch (type) {
    case NOTIFICATION_TYPES.EVIDENCE_APPROVED:
    case NOTIFICATION_TYPES.EXTENSION_APPROVED:
    case NOTIFICATION_TYPES.QUEST_COMPLETED:
    case NOTIFICATION_TYPES.ACHIEVEMENT_UNLOCKED:
      return 'text-green-500'
    case NOTIFICATION_TYPES.EVIDENCE_REJECTED:
    case NOTIFICATION_TYPES.EXTENSION_DENIED:
    case NOTIFICATION_TYPES.QUEST_ABANDONED:
      return 'text-red-500'
    case NOTIFICATION_TYPES.DEADLINE_APPROACHING:
      return 'text-amber-500'
    case NOTIFICATION_TYPES.QUEST_ACCEPTED:
    case NOTIFICATION_TYPES.EVIDENCE_SUBMITTED:
    case NOTIFICATION_TYPES.EXTENSION_REQUESTED:
      return 'text-blue-500'
    default:
      return 'text-muted-foreground'
  }
}

/**
 * Get display label for notification type
 */
export function getNotificationTypeLabel(type: string): string {
  switch (type) {
    case NOTIFICATION_TYPES.EVIDENCE_APPROVED:
      return 'Evidence Approved'
    case NOTIFICATION_TYPES.EVIDENCE_REJECTED:
      return 'Evidence Rejected'
    case NOTIFICATION_TYPES.EXTENSION_APPROVED:
      return 'Extension Approved'
    case NOTIFICATION_TYPES.EXTENSION_DENIED:
      return 'Extension Denied'
    case NOTIFICATION_TYPES.QUEST_COMPLETED:
      return 'Quest Completed'
    case NOTIFICATION_TYPES.ACHIEVEMENT_UNLOCKED:
      return 'Achievement Unlocked'
    case NOTIFICATION_TYPES.DEADLINE_APPROACHING:
      return 'Deadline Approaching'
    case NOTIFICATION_TYPES.QUEST_ACCEPTED:
      return 'Quest Accepted'
    case NOTIFICATION_TYPES.EVIDENCE_SUBMITTED:
      return 'Evidence Submitted'
    case NOTIFICATION_TYPES.EXTENSION_REQUESTED:
      return 'Extension Requested'
    case NOTIFICATION_TYPES.QUEST_ABANDONED:
      return 'Quest Abandoned'
    default:
      return 'Notification'
  }
}
