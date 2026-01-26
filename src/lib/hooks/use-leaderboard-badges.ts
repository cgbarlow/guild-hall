'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

/**
 * Quest badge data for leaderboard display
 */
export interface LeaderboardBadge {
  id: string
  name: string
  badge_url: string | null
  completed_at: string
}

/**
 * User badges map for leaderboard entries
 */
export type LeaderboardBadgesMap = Record<string, LeaderboardBadge[]>

/**
 * Fetch quest badges for multiple users at once (for leaderboard display)
 * Shows badges from completed quests
 */
async function fetchLeaderboardBadges(userIds: string[]): Promise<LeaderboardBadgesMap> {
  if (userIds.length === 0) {
    return {}
  }

  const supabase = createClient()

  // Type for joined query result
  type UserQuestResult = {
    user_id: string
    completed_at: string | null
    quests: {
      id: string
      title: string
      badge_url: string | null
    } | null
  }

  const { data, error } = await supabase
    .from('user_quests')
    .select(`
      user_id,
      completed_at,
      quests (
        id,
        title,
        badge_url
      )
    `)
    .in('user_id', userIds)
    .eq('status', 'completed')
    .not('quests.badge_url', 'is', null)
    .order('completed_at', { ascending: false })

  if (error) {
    console.error('Error fetching leaderboard badges:', error)
    return {}
  }

  const typedData = (data || []) as unknown as UserQuestResult[]

  // Group badges by user_id, only include quests with badge_url
  const badgesMap: LeaderboardBadgesMap = {}
  typedData.forEach((item) => {
    if (!item.quests || !item.quests.badge_url) return

    if (!badgesMap[item.user_id]) {
      badgesMap[item.user_id] = []
    }

    badgesMap[item.user_id].push({
      id: item.quests.id,
      name: item.quests.title,
      badge_url: item.quests.badge_url,
      completed_at: item.completed_at || '',
    })
  })

  return badgesMap
}

/**
 * Hook to fetch badges for leaderboard users
 */
export function useLeaderboardBadges(userIds: string[]) {
  return useQuery({
    queryKey: ['leaderboard-badges', userIds],
    queryFn: () => fetchLeaderboardBadges(userIds),
    enabled: userIds.length > 0,
    staleTime: 60 * 1000, // 1 minute
  })
}
