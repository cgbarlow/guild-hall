'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { ActivityWithUser } from '@/lib/types/activity'

/**
 * Fetch global public activities (for leaderboard/dashboard)
 */
async function fetchGlobalActivity(limit: number = 20): Promise<ActivityWithUser[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('activities')
    .select(`
      *,
      users!activities_user_id_fkey (
        id,
        display_name,
        avatar_url
      )
    `)
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching global activity:', error)
    throw error
  }

  // Transform to ActivityWithUser
  return (data || []).map((item) => ({
    id: item.id,
    user_id: item.user_id,
    type: item.type,
    title: item.title,
    description: item.description,
    reference_type: item.reference_type,
    reference_id: item.reference_id,
    points_earned: item.points_earned,
    is_public: item.is_public,
    created_at: item.created_at,
    user: item.users as ActivityWithUser['user'],
  }))
}

interface UseGlobalActivityOptions {
  limit?: number
  enabled?: boolean
}

/**
 * Hook to fetch the global activity feed (public activities from all users)
 */
export function useGlobalActivity(options: UseGlobalActivityOptions = {}) {
  const { limit = 20, enabled = true } = options

  return useQuery({
    queryKey: ['globalActivity', limit],
    queryFn: async () => {
      try {
        return await fetchGlobalActivity(limit)
      } catch (error) {
        console.error('Error fetching global activity:', error)
        return []
      }
    },
    enabled,
    // Refetch more frequently for live feel
    refetchInterval: 60000, // 1 minute
  })
}
