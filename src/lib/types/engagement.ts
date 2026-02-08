// Engagement feature types
// ADR: ADR-012-Engagement-Improvements

// ============================================================
// Skill Tiers (SPEC-012-A)
// ============================================================

export type SkillTierName = 'Apprentice' | 'Journeyman' | 'Expert' | 'Master' | 'Legend'

export interface TierConfig {
  tier_level: number
  name: string
  min_points: number
  icon: string
  color: string
}

export interface TierInfo {
  tier: TierConfig
  points: number
  nextTier: TierConfig | null
  pointsToNext: number
  progressPercent: number
}

// Tier color styling
export const TIER_COLOR_STYLES: Record<string, {
  bg: string
  text: string
  border: string
  progressBar: string
}> = {
  green: {
    bg: 'bg-green-50 dark:bg-green-950/20',
    text: 'text-green-700 dark:text-green-300',
    border: 'border-green-200 dark:border-green-800',
    progressBar: 'bg-green-500',
  },
  emerald: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/20',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800',
    progressBar: 'bg-emerald-500',
  },
  teal: {
    bg: 'bg-teal-50 dark:bg-teal-950/20',
    text: 'text-teal-700 dark:text-teal-300',
    border: 'border-teal-200 dark:border-teal-800',
    progressBar: 'bg-teal-500',
  },
  cyan: {
    bg: 'bg-cyan-50 dark:bg-cyan-950/20',
    text: 'text-cyan-700 dark:text-cyan-300',
    border: 'border-cyan-200 dark:border-cyan-800',
    progressBar: 'bg-cyan-500',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-950/20',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800',
    progressBar: 'bg-gradient-to-r from-amber-400 to-yellow-500',
  },
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-950/20',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800',
    progressBar: 'bg-blue-500',
  },
  red: {
    bg: 'bg-red-50 dark:bg-red-950/20',
    text: 'text-red-700 dark:text-red-300',
    border: 'border-red-200 dark:border-red-800',
    progressBar: 'bg-red-500',
  },
}

// ============================================================
// Streaks (SPEC-012-C)
// ============================================================

export type WeekendBehavior = 'weekends_count' | 'weekends_freeze' | 'weekends_optional'

export interface StreakInfo {
  currentStreak: number
  longestStreak: number
  lastActivityDate: string | null
  weekendBehavior: WeekendBehavior
  isStreakAtRisk: boolean
}

export interface UserStreak {
  user_id: string
  current_streak: number
  longest_streak: number
  last_activity_date: string | null
  weekend_behavior: WeekendBehavior
  timezone: string
  created_at: string
  updated_at: string
}

// Streak milestone thresholds
export const STREAK_MILESTONES: Array<{ days: number; label: string; emoji: string }> = [
  { days: 7, label: 'Week Warrior', emoji: '🔥' },
  { days: 14, label: 'Fortnight Fighter', emoji: '💪' },
  { days: 30, label: 'Monthly Master', emoji: '⭐' },
  { days: 100, label: 'Century Champion', emoji: '🏆' },
]

// ============================================================
// Contextual Greetings (SPEC-012-B)
// ============================================================

export type GreetingPriority = 'celebration' | 'action' | 'progression' | 'time'

export interface GreetingContext {
  priority: GreetingPriority
  message: string
  subMessage?: string
  icon?: string
}

export interface GreetingData {
  // Recent completions
  recentlyCompletedQuests: Array<{
    quest_id: string
    quest_title: string
    completed_at: string
  }>

  // Tier changes
  previousTierLevel: number | null
  currentTierLevel: number

  // Action items
  approvedObjectivesCount: number

  // Deadlines
  upcomingDeadlines: Array<{
    quest_id: string
    quest_title: string
    deadline: string
    days_remaining: number
  }>

  // Progression
  pointsToNextTier: number
  nextTierName: string | null

  // Streak
  currentStreak: number

  // User info
  displayName: string
  localHour: number
}

// ============================================================
// Nudge Banners (SPEC-012-B)
// ============================================================

export type NudgePriority =
  | 'approved_ready'
  | 'deadline_soon'
  | 'celebration'
  | 'quest_recommendation'
  | 'badge_ready_to_claim'

export interface NudgeBannerData {
  priority: NudgePriority
  message: string
  actionUrl: string
  actionLabel: string
  variant: 'info' | 'warning' | 'success' | 'celebration'
}

// ============================================================
// Philosophy Quotes (SPEC-012-D)
// ============================================================

export interface PhilosophyQuote {
  id: string
  quote: string
  attribution: string | null
  is_active: boolean
  display_order: number | null
  created_by: string | null
  created_at: string
  updated_at: string
}

// ============================================================
// Email Preferences (SPEC-012-E, SPEC-012-F)
// ============================================================

export interface GMEmailPreferences {
  user_id: string
  daily_digest_enabled: boolean
  digest_time: string
  timezone: string
  last_digest_sent_at: string | null
  default_quest_filter: 'all' | 'draft' | 'published' | 'archived'
  created_at: string
  updated_at: string
}

export interface UserWeeklyEmailPrefs {
  user_id: string
  enabled: boolean
  day_of_week: number
  send_time: string
  timezone: string
  last_sent_at: string | null
  created_at: string
  updated_at: string
}

export const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
]

// Granular email preferences for different notification types
export interface UserEmailPreferences {
  user_id: string
  // Quest related
  quest_accepted_email: boolean
  quest_completed_email: boolean
  // Objective related
  objective_submitted_email: boolean
  objective_approved_email: boolean
  objective_rejected_email: boolean
  // Achievement related
  badge_earned_email: boolean
  badge_ready_to_claim_email: boolean
  // Progress related
  weekly_progress_email: boolean
  deadline_reminder_email: boolean
  // Timestamps
  created_at: string
  updated_at: string
}

// ============================================================
// Enriched Stats
// ============================================================

export interface EnrichedStats {
  totalPoints: number
  rank: number
  totalUsers: number
  activeQuests: number
  completedQuests: number
  pendingObjectives: number
  approvedObjectives: number
  tier: TierInfo
  streak: StreakInfo | null
}

// ============================================================
// Quest Recommendation
// ============================================================

export interface QuestRecommendation {
  quest_id: string
  quest_title: string
  reason: string
  match_score: number
}

// ============================================================
// Activity Feed (SPEC-012-G - Phase 7)
// ============================================================

export type ActivityFeedType =
  | 'quest_completion'
  | 'objective_completion'
  | 'streak_milestone'
  | 'tier_advancement'
  | 'badge_earned'

export interface ActivityFeedUser {
  id: string
  display_name: string | null
  avatar_url: string | null
}

export interface BaseActivityFeedItem {
  id: string
  type: ActivityFeedType
  user: ActivityFeedUser
  timestamp: string
}

export interface QuestCompletionActivity extends BaseActivityFeedItem {
  type: 'quest_completion'
  data: {
    quest_id: string
    quest_title: string
    points_earned: number
  }
}

export interface ObjectiveCompletionActivity extends BaseActivityFeedItem {
  type: 'objective_completion'
  data: {
    objective_id: string
    objective_title: string
    quest_title: string
    points_earned: number
  }
}

export interface StreakMilestoneActivity extends BaseActivityFeedItem {
  type: 'streak_milestone'
  data: {
    streak_days: number
    milestone_label: string
    milestone_emoji: string
  }
}

export interface TierAdvancementActivity extends BaseActivityFeedItem {
  type: 'tier_advancement'
  data: {
    previous_tier: string
    new_tier: string
    new_tier_icon: string
    new_tier_color: string
  }
}

export interface BadgeEarnedActivity extends BaseActivityFeedItem {
  type: 'badge_earned'
  data: {
    badge_id: string
    badge_name: string
    badge_description: string
  }
}

export type ActivityFeedItem =
  | QuestCompletionActivity
  | ObjectiveCompletionActivity
  | StreakMilestoneActivity
  | TierAdvancementActivity
  | BadgeEarnedActivity

// Activity feed milestone thresholds for display
export const ACTIVITY_STREAK_MILESTONES = [
  { days: 7, label: 'Week Warrior', emoji: '🔥' },
  { days: 14, label: 'Fortnight Fighter', emoji: '💪' },
  { days: 30, label: 'Monthly Master', emoji: '⭐' },
  { days: 60, label: 'Two-Month Titan', emoji: '🏅' },
  { days: 90, label: 'Quarter Champion', emoji: '🏆' },
]

// ============================================================
// Guild Events (SPEC-012-G - Phase 7)
// ============================================================

export interface GuildEvent {
  id: string
  title: string
  date: Date
  endDate?: Date
  location?: string
  url?: string
}

// ============================================================
// User Engagement Preferences (SPEC-012-G - Phase 7)
// ============================================================

export interface UserEngagementPreferences {
  show_activity_in_feed: boolean
  show_streak_publicly: boolean
  enable_nudge_banners: boolean
}
