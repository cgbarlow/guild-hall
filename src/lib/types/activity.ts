/**
 * Activity types for the activity feed
 */
export type ActivityType =
  | 'quest_accepted'
  | 'objective_completed'
  | 'quest_completed'
  | 'badge_earned'
  | 'level_up'

/**
 * Reference types for activities
 */
export type ActivityReferenceType =
  | 'quest'
  | 'objective'
  | 'badge'
  | 'achievement'

/**
 * Activity record from the database
 */
export interface Activity {
  id: string
  user_id: string
  type: ActivityType
  title: string
  description: string | null
  reference_type: ActivityReferenceType | null
  reference_id: string | null
  points_earned: number
  is_public: boolean
  created_at: string
}

/**
 * Activity with user information for display
 */
export interface ActivityWithUser extends Activity {
  user: {
    id: string
    display_name: string | null
    avatar_url: string | null
  } | null
}

/**
 * Activity display info based on type
 */
export interface ActivityDisplayInfo {
  icon: string
  color: string
  label: string
}

/**
 * Get display info for an activity type
 */
export function getActivityDisplayInfo(type: ActivityType): ActivityDisplayInfo {
  const displayMap: Record<ActivityType, ActivityDisplayInfo> = {
    quest_accepted: {
      icon: 'scroll',
      color: 'text-blue-500',
      label: 'Quest Accepted',
    },
    objective_completed: {
      icon: 'check-circle',
      color: 'text-green-500',
      label: 'Objective Completed',
    },
    quest_completed: {
      icon: 'trophy',
      color: 'text-yellow-500',
      label: 'Quest Completed',
    },
    badge_earned: {
      icon: 'award',
      color: 'text-purple-500',
      label: 'Badge Earned',
    },
    level_up: {
      icon: 'trending-up',
      color: 'text-orange-500',
      label: 'Level Up',
    },
  }

  return displayMap[type] || { icon: 'activity', color: 'text-gray-500', label: 'Activity' }
}
