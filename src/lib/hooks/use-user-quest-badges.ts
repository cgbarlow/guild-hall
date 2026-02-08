'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { QuestBadge } from '@/lib/types/public-profile'

/**
 * Format date for display
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
}

/**
 * Fetch user's earned quest badges (completed quests with badge images)
 */
async function fetchUserQuestBadges(userId: string): Promise<QuestBadge[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('user_quests')
    .select(`
      id,
      completed_at,
      quests (
        id,
        title,
        badge_url
      )
    `)
    .eq('user_id', userId)
    .eq('status', 'completed')
    .not('quests.badge_url', 'is', null)
    .order('completed_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching user quest badges:', error)
    return []
  }

  return (data || [])
    .filter((uq: any) => uq.quests && uq.quests.badge_url)
    .map((uq: any) => ({
      id: uq.id,
      quest_id: uq.quests.id,
      quest_title: uq.quests.title,
      badge_url: uq.quests.badge_url,
      completed_at: uq.completed_at || '',
      formatted_date: uq.completed_at ? formatDate(uq.completed_at) : '',
    }))
}

/**
 * Hook to get user's earned quest badges
 */
export function useUserQuestBadges(userId: string | undefined) {
  return useQuery({
    queryKey: ['userQuestBadges', userId],
    queryFn: () => fetchUserQuestBadges(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
