'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/types/database'

/**
 * Tier info for leaderboard display
 */
export interface LeaderboardTierInfo {
  name: string
  icon: string
  color: string
}

/**
 * Leaderboard entry type matching the leaderboard view
 */
export interface LeaderboardEntry {
  id: string
  display_name: string | null
  avatar_url: string | null
  points: number
  quests_completed: number
  rank: number
  tier?: LeaderboardTierInfo
}

type LeaderboardRow = Database['public']['Views']['leaderboard']['Row']

/**
 * Get tier info based on points
 */
function getTierFromPoints(points: number, tiers: any[]): LeaderboardTierInfo {
  // Default tier if no tiers available
  const defaultTier = { name: 'Apprentice', icon: 'Sprout', color: 'green' }

  if (!tiers || tiers.length === 0) return defaultTier

  // Sort tiers by min_points descending
  const sortedTiers = [...tiers].sort((a, b) => b.min_points - a.min_points)

  // Find the tier (highest tier where points >= min_points)
  for (const tier of sortedTiers) {
    if (points >= tier.min_points) {
      return {
        name: tier.name,
        icon: tier.icon,
        color: tier.color,
      }
    }
  }

  // Return lowest tier
  return {
    name: sortedTiers[sortedTiers.length - 1]?.name || 'Apprentice',
    icon: sortedTiers[sortedTiers.length - 1]?.icon || 'Sprout',
    color: sortedTiers[sortedTiers.length - 1]?.color || 'green',
  }
}

/**
 * Fetch leaderboard data from the database view
 */
async function fetchLeaderboard(limit?: number): Promise<LeaderboardEntry[]> {
  const supabase = createClient()

  // Fetch tier config for tier calculations
  const { data: tierConfig } = await (supabase as any)
    .from('skill_tier_config')
    .select('*')
    .order('min_points', { ascending: true })

  // Use type assertion for the view query since Supabase types don't auto-detect views
  let query = supabase
    .from('leaderboard' as 'users') // Type workaround for views
    .select('*')
    .order('rank' as 'id', { ascending: true })

  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query

  if (error) {
    throw error
  }

  // Cast and transform the data
  const entries = data as unknown as LeaderboardRow[]
  return (entries || []).map((entry) => ({
    id: entry.id,
    display_name: entry.display_name,
    avatar_url: entry.avatar_url,
    points: entry.points,
    quests_completed: entry.quests_completed,
    rank: Number(entry.rank),
    tier: getTierFromPoints(entry.points, tierConfig || []),
  }))
}

/**
 * Hook to fetch leaderboard data
 * @param limit - Optional limit on number of entries to fetch
 */
export function useLeaderboard(limit?: number) {
  return useQuery({
    queryKey: ['leaderboard', limit],
    queryFn: () => fetchLeaderboard(limit),
    staleTime: 30 * 1000, // 30 seconds - leaderboard can be slightly stale
  })
}

/**
 * Fetch the current user's rank
 */
async function fetchUserRank(): Promise<{ rank: number; total: number } | null> {
  const supabase = createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return null
  }

  // Check if user appears on the leaderboard
  const { data: userEntry } = await supabase
    .from('leaderboard' as 'users')
    .select('rank' as 'id')
    .eq('id', user.id)
    .single()

  // Get total count of users on leaderboard
  const { count } = await supabase
    .from('leaderboard' as 'users')
    .select('*', { count: 'exact', head: true })

  if (!userEntry) {
    // User not on leaderboard (privacy settings)
    return null
  }

  const entry = userEntry as unknown as { rank: number }
  return {
    rank: Number(entry.rank),
    total: count || 0,
  }
}

/**
 * Hook to fetch the current user's rank on the leaderboard
 */
export function useUserRank() {
  return useQuery({
    queryKey: ['leaderboard', 'user-rank'],
    queryFn: fetchUserRank,
    staleTime: 30 * 1000,
  })
}

/**
 * Fetch top N users for a compact leaderboard display
 */
async function fetchTopUsers(count: number = 5): Promise<LeaderboardEntry[]> {
  const supabase = createClient()

  // Fetch tier config for tier calculations
  const { data: tierConfig } = await (supabase as any)
    .from('skill_tier_config')
    .select('*')
    .order('min_points', { ascending: true })

  const { data, error } = await supabase
    .from('leaderboard' as 'users')
    .select('*')
    .order('rank' as 'id', { ascending: true })
    .limit(count)

  if (error) {
    throw error
  }

  const entries = data as unknown as LeaderboardRow[]
  return (entries || []).map((entry) => ({
    id: entry.id,
    display_name: entry.display_name,
    avatar_url: entry.avatar_url,
    points: entry.points,
    quests_completed: entry.quests_completed,
    rank: Number(entry.rank),
    tier: getTierFromPoints(entry.points, tierConfig || []),
  }))
}

/**
 * Hook to fetch top N users for compact display
 */
export function useTopUsers(count: number = 5) {
  return useQuery({
    queryKey: ['leaderboard', 'top', count],
    queryFn: () => fetchTopUsers(count),
    staleTime: 60 * 1000, // 1 minute
  })
}
