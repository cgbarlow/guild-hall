'use server'

import { createClient } from '@/lib/supabase/server'
import type {
  PublicProfile,
  PublicProfileResult,
  Achievement,
  PrivacySettings,
} from '@/lib/types/public-profile'

// Type for user query result
type UserQueryResult = {
  id: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  total_points: number | null
  quests_completed: number | null
}

// Type for privacy settings from table
type PrivacySettingsRow = {
  profile_public: boolean
  show_on_leaderboard: boolean
  show_badges: boolean
}

// Type for user achievements query result
type UserAchievementQueryResult = {
  id: string
  earned_at: string
  achievements: {
    id: string
    name: string
    description: string
    icon: string
  } | null
}

/**
 * Default display name for users without one set
 */
const DEFAULT_DISPLAY_NAME = 'Anonymous Adventurer'

/**
 * Server-side function to fetch a public profile
 * Used for SSR/SEO purposes in server components
 *
 * @param userId - The ID of the user to fetch
 * @returns PublicProfileResult
 */
export async function fetchPublicProfile(userId: string): Promise<PublicProfileResult> {
  const supabase = await createClient()

  // Fetch the user profile
  const { data: rawUserData, error: userError } = await supabase
    .from('users')
    .select('id, display_name, avatar_url, bio, total_points, quests_completed')
    .eq('id', userId)
    .single()

  // Handle errors
  if (userError) {
    if (userError.code === 'PGRST116') {
      return { status: 'not_found' }
    }
    return { status: 'error', error: userError.message }
  }

  if (!rawUserData) {
    return { status: 'not_found' }
  }

  const userData = rawUserData as unknown as UserQueryResult

  // Fetch privacy settings from the privacy_settings TABLE
  const { data: privacyData } = await supabase
    .from('privacy_settings')
    .select('profile_public, show_on_leaderboard, show_badges')
    .eq('user_id', userId)
    .single()

  const privacySettings = privacyData as PrivacySettingsRow | null

  // Check if profile is visible (default to true if no privacy settings exist)
  if (privacySettings && !privacySettings.profile_public) {
    return { status: 'private' }
  }

  // Build the public profile
  const publicProfile: PublicProfile = {
    id: userData.id,
    display_name: userData.display_name ?? DEFAULT_DISPLAY_NAME,
    avatar_url: userData.avatar_url,
    bio: userData.bio,
    total_points: userData.total_points ?? 0,
    quests_completed: userData.quests_completed ?? 0,
    achievements: [],
  }

  // Fetch achievements if allowed (default to true if no privacy settings)
  const showBadges = privacySettings?.show_badges ?? true
  if (showBadges) {
    const { data: rawAchievementsData } = await supabase
      .from('user_achievements')
      .select(`
        id,
        earned_at,
        achievements (
          id,
          name,
          description,
          icon
        )
      `)
      .eq('user_id', userId)
      .order('earned_at', { ascending: false })
      .limit(50)

    const achievementsData = (rawAchievementsData || []) as unknown as UserAchievementQueryResult[]

    if (achievementsData.length > 0) {
      publicProfile.achievements = achievementsData.map((ua) => ({
        id: ua.achievements?.id ?? ua.id,
        name: ua.achievements?.name ?? 'Unknown',
        description: ua.achievements?.description ?? '',
        icon: ua.achievements?.icon ?? 'trophy',
        earned_at: ua.earned_at,
      })) as Achievement[]
    }
  }

  // Fetch leaderboard position if allowed (default to true if no privacy settings)
  const showOnLeaderboard = privacySettings?.show_on_leaderboard ?? true
  if (showOnLeaderboard) {
    // Type assertion needed due to Supabase type inference issues
    const { data: leaderboardData } = await (supabase as unknown as {
      rpc: (fn: string, params: Record<string, unknown>) => Promise<{ data: unknown }>
    }).rpc('get_leaderboard_position', { user_id: userId })

    if (leaderboardData) {
      publicProfile.leaderboard_position =
        typeof leaderboardData === 'number'
          ? leaderboardData
          : (leaderboardData as { position?: number }).position
    }
  }

  return { status: 'success', data: publicProfile }
}
