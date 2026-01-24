'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/types/database'

type Achievement = Database['public']['Tables']['achievements']['Row']
type UserAchievement = Database['public']['Tables']['user_achievements']['Row']

/**
 * Achievement with earned status for the current user
 */
export interface UserAchievementWithDetails extends Achievement {
  earned: boolean
  earned_at: string | null
}

/**
 * Fetch all achievements with the user's earned status
 */
async function fetchUserAchievements(): Promise<UserAchievementWithDetails[]> {
  const supabase = createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }

  // Fetch all achievements
  const { data: rawAchievements, error: achievementsError } = await supabase
    .from('achievements')
    .select('*')
    .order('points', { ascending: false })

  if (achievementsError) {
    throw achievementsError
  }

  const achievements = (rawAchievements || []) as unknown as Achievement[]

  // Fetch user's earned achievements
  // Type for query result
  type UserAchievementResult = { achievement_id: string; earned_at: string }

  const { data: userAchievements, error: userAchievementsError } = await supabase
    .from('user_achievements')
    .select('*')
    .eq('user_id', user.id)

  if (userAchievementsError) {
    throw userAchievementsError
  }

  // Create a map of earned achievements
  const earnedMap = new Map<string, string>()
  const typedUserAchievements = (userAchievements || []) as unknown as UserAchievementResult[]
  typedUserAchievements.forEach((ua) => {
    earnedMap.set(ua.achievement_id, ua.earned_at)
  })

  // Combine data
  return achievements.map((achievement) => ({
    ...achievement,
    earned: earnedMap.has(achievement.id),
    earned_at: earnedMap.get(achievement.id) || null,
  }))
}

/**
 * Hook to fetch all achievements with the user's earned status
 */
export function useAchievements() {
  return useQuery({
    queryKey: ['achievements'],
    queryFn: fetchUserAchievements,
  })
}

/**
 * Fetch only the achievements the user has earned
 */
async function fetchEarnedAchievements(): Promise<(Achievement & { earned_at: string })[]> {
  const supabase = createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }

  // Fetch user's earned achievements with achievement details
  // Type for joined query result
  type EarnedAchievementResult = { earned_at: string; achievements: Achievement }

  const { data, error } = await supabase
    .from('user_achievements')
    .select(`
      earned_at,
      achievements (*)
    `)
    .eq('user_id', user.id)
    .order('earned_at', { ascending: false })

  if (error) {
    throw error
  }

  // Transform the data
  const typedData = (data || []) as unknown as EarnedAchievementResult[]
  return typedData.map((item) => ({
    ...item.achievements,
    earned_at: item.earned_at,
  }))
}

/**
 * Hook to fetch only achievements the user has earned
 */
export function useEarnedAchievements() {
  return useQuery({
    queryKey: ['achievements', 'earned'],
    queryFn: fetchEarnedAchievements,
  })
}

/**
 * Fetch achievements for a specific user (for public profiles)
 */
async function fetchUserPublicAchievements(userId: string): Promise<(Achievement & { earned_at: string })[]> {
  const supabase = createClient()

  // Type for privacy settings
  type PrivacyResult = { show_stats: boolean; show_profile: boolean }

  // Check if user allows showing achievements
  const { data: rawPrivacy } = await supabase
    .from('privacy_settings')
    .select('show_stats, show_profile')
    .eq('user_id', userId)
    .single()

  const privacy = rawPrivacy as unknown as PrivacyResult | null

  if (!privacy?.show_stats || !privacy?.show_profile) {
    return []
  }

  // Fetch user's earned achievements with achievement details
  // Type for joined query result
  type EarnedAchievementResult = { earned_at: string; achievements: Achievement }

  const { data, error } = await supabase
    .from('user_achievements')
    .select(`
      earned_at,
      achievements (*)
    `)
    .eq('user_id', userId)
    .order('earned_at', { ascending: false })

  if (error) {
    throw error
  }

  // Transform the data
  const typedData = (data || []) as unknown as EarnedAchievementResult[]
  return typedData.map((item) => ({
    ...item.achievements,
    earned_at: item.earned_at,
  }))
}

/**
 * Hook to fetch achievements for a specific user's public profile
 */
export function useUserPublicAchievements(userId: string) {
  return useQuery({
    queryKey: ['achievements', 'user', userId],
    queryFn: () => fetchUserPublicAchievements(userId),
    enabled: !!userId,
  })
}

/**
 * Fetch achievement count for the current user
 */
async function fetchAchievementCount(): Promise<{ earned: number; total: number }> {
  const supabase = createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { earned: 0, total: 0 }
  }

  // Fetch total achievements count
  const { count: total } = await supabase
    .from('achievements')
    .select('*', { count: 'exact', head: true })

  // Fetch user's earned achievements count
  const { count: earned } = await supabase
    .from('user_achievements')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  return {
    earned: earned || 0,
    total: total || 0,
  }
}

/**
 * Hook to fetch achievement count
 */
export function useAchievementCount() {
  return useQuery({
    queryKey: ['achievements', 'count'],
    queryFn: fetchAchievementCount,
  })
}
