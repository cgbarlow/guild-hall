/**
 * Achievement earned by a user
 */
export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  earned_at: string
}

/**
 * Quest badge earned by completing a quest
 */
export interface QuestBadge {
  id: string
  quest_id: string
  quest_title: string
  badge_url: string
  completed_at: string
  formatted_date: string // Pre-formatted to avoid hydration errors
}

/**
 * Privacy settings for a user profile
 */
export interface PrivacySettings {
  profile_visibility: boolean
  show_achievements: boolean
  show_on_leaderboard: boolean
}

/**
 * User profile data from the users table
 */
export interface UserProfile {
  id: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  total_points: number
  quests_completed: number
  privacy_settings: PrivacySettings
}

/**
 * Public profile data visible to other users
 * Only includes data that the user has allowed to be visible
 */
export interface PublicProfile {
  id: string
  display_name: string
  avatar_url: string | null
  bio: string | null
  total_points: number
  achievements: Achievement[]
  quest_badges: QuestBadge[]
  leaderboard_position?: number
  quests_completed: number
}

/**
 * Result of fetching a public profile
 */
export type PublicProfileResult =
  | { status: 'success'; data: PublicProfile }
  | { status: 'not_found' }
  | { status: 'private' }
  | { status: 'error'; error: string }
