'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/types/database'

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
}

type LeaderboardRow = Database['public']['Views']['leaderboard']['Row']

/**
 * Fetch leaderboard data from the database view
 */
async function fetchLeaderboard(limit?: number): Promise<LeaderboardEntry[]> {
  const supabase = createClient()

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

  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')
    .order('rank', { ascending: true })
    .limit(count)

  if (error) {
    throw error
  }

  return (data || []).map((entry) => ({
    id: entry.id,
    display_name: entry.display_name,
    avatar_url: entry.avatar_url,
    points: entry.points,
    quests_completed: entry.quests_completed,
    rank: Number(entry.rank),
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
