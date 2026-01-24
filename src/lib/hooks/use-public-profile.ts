'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type {
  PublicProfile,
  PublicProfileResult,
  Achievement,
  PrivacySettings,
} from '@/lib/types/public-profile'

/**
 * Query key for public profile data
 */
export const publicProfileQueryKey = (userId: string) =>
  ['publicProfile', userId] as const

/**
 * Default display name for users without one set
 */
const DEFAULT_DISPLAY_NAME = 'Anonymous Adventurer'

/**
 * Default privacy settings when not set
 */
const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  profile_visibility: false,
  show_achievements: false,
  show_on_leaderboard: false,
}

/**
 * Hook to fetch a public user profile by user ID
 *
 * Respects privacy settings:
 * - Returns 'private' status if profile_visibility is false
 * - Only includes achievements if show_achievements is true
 * - Only includes leaderboard_position if show_on_leaderboard is true
 *
 * @param userId - The ID of the user to fetch
 * @returns Query result with PublicProfileResult data
 */
export function usePublicProfile(userId: string) {
  const supabase = createClient()

  return useQuery<PublicProfileResult>({
    queryKey: publicProfileQueryKey(userId),
    queryFn: async (): Promise<PublicProfileResult> => {
      // Fetch the user profile with privacy settings
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select(`
          id,
          display_name,
          avatar_url,
          bio,
          total_points,
          quests_completed,
          privacy_settings
        `)
        .eq('id', userId)
        .single()

      // Handle errors
      if (userError) {
        // Check if it's a "not found" error
        if (userError.code === 'PGRST116') {
          return { status: 'not_found' }
        }
        return { status: 'error', error: userError.message }
      }

      if (!userData) {
        return { status: 'not_found' }
      }

      // Parse privacy settings (handle both JSON string and object)
      const privacySettings: PrivacySettings =
        typeof userData.privacy_settings === 'string'
          ? JSON.parse(userData.privacy_settings)
          : userData.privacy_settings ?? DEFAULT_PRIVACY_SETTINGS

      // Check if profile is visible
      if (!privacySettings.profile_visibility) {
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

      // Fetch achievements if allowed
      if (privacySettings.show_achievements) {
        const { data: achievementsData } = await supabase
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

        if (achievementsData) {
          publicProfile.achievements = achievementsData.map((ua) => ({
            id: (ua.achievements as { id: string })?.id ?? ua.id,
            name: (ua.achievements as { name: string })?.name ?? 'Unknown',
            description: (ua.achievements as { description: string })?.description ?? '',
            icon: (ua.achievements as { icon: string })?.icon ?? 'trophy',
            earned_at: ua.earned_at,
          })) as Achievement[]
        }
      }

      // Fetch leaderboard position if allowed
      if (privacySettings.show_on_leaderboard) {
        const { data: leaderboardData } = await supabase
          .rpc('get_leaderboard_position', { user_id: userId })

        if (leaderboardData) {
          // Handle both direct position and object with position property
          publicProfile.leaderboard_position =
            typeof leaderboardData === 'number'
              ? leaderboardData
              : (leaderboardData as { position?: number }).position
        }
      }

      return { status: 'success', data: publicProfile }
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  })
}

/**
 * Server-side function to fetch a public profile
 * Used for SSR/SEO purposes in server components
 *
 * @param supabase - Server Supabase client
 * @param userId - The ID of the user to fetch
 * @returns PublicProfileResult
 */
export async function fetchPublicProfile(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<PublicProfileResult> {
  // Fetch the user profile with privacy settings
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select(`
      id,
      display_name,
      avatar_url,
      bio,
      total_points,
      quests_completed,
      privacy_settings
    `)
    .eq('id', userId)
    .single()

  // Handle errors
  if (userError) {
    if (userError.code === 'PGRST116') {
      return { status: 'not_found' }
    }
    return { status: 'error', error: userError.message }
  }

  if (!userData) {
    return { status: 'not_found' }
  }

  // Parse privacy settings
  const privacySettings: PrivacySettings =
    typeof userData.privacy_settings === 'string'
      ? JSON.parse(userData.privacy_settings)
      : userData.privacy_settings ?? DEFAULT_PRIVACY_SETTINGS

  // Check if profile is visible
  if (!privacySettings.profile_visibility) {
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

  // Fetch achievements if allowed
  if (privacySettings.show_achievements) {
    const { data: achievementsData } = await supabase
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

    if (achievementsData) {
      publicProfile.achievements = achievementsData.map((ua) => ({
        id: (ua.achievements as { id: string })?.id ?? ua.id,
        name: (ua.achievements as { name: string })?.name ?? 'Unknown',
        description: (ua.achievements as { description: string })?.description ?? '',
        icon: (ua.achievements as { icon: string })?.icon ?? 'trophy',
        earned_at: ua.earned_at,
      })) as Achievement[]
    }
  }

  // Fetch leaderboard position if allowed
  if (privacySettings.show_on_leaderboard) {
    const { data: leaderboardData } = await supabase
      .rpc('get_leaderboard_position', { user_id: userId })

    if (leaderboardData) {
      publicProfile.leaderboard_position =
        typeof leaderboardData === 'number'
          ? leaderboardData
          : (leaderboardData as { position?: number }).position
    }
  }

  return { status: 'success', data: publicProfile }
}
