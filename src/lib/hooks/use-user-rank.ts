'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

/**
 * Fetch user's leaderboard rank
 */
async function fetchUserRank(userId: string): Promise<number | null> {
  const supabase = createClient()

  const { data, error } = await (supabase as unknown as {
    rpc: (fn: string, params: Record<string, unknown>) => Promise<{ data: unknown; error: Error | null }>
  }).rpc('get_leaderboard_position', { user_id: userId })

  if (error) {
    console.error('Error fetching user rank:', error)
    return null
  }

  if (typeof data === 'number') {
    return data
  }

  return (data as { position?: number })?.position ?? null
}

/**
 * Hook to get user's leaderboard rank
 */
export function useUserRank(userId: string | undefined) {
  return useQuery({
    queryKey: ['userRank', userId],
    queryFn: () => fetchUserRank(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
