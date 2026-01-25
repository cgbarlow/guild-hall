'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/auth-context'

/**
 * Fetch count of active user quests (people taking quests)
 */
async function fetchActiveQuestCount(): Promise<number> {
  const supabase = createClient()

  const { count, error } = await supabase
    .from('user_quests')
    .select('*', { count: 'exact', head: true })
    .in('status', ['accepted', 'in_progress'])

  if (error) {
    console.error('Error fetching active quest count:', error)
    return 0
  }

  return count ?? 0
}

/**
 * React Query hook to fetch count of active user quests
 * This counts how many people are currently taking quests
 */
export function useActiveQuestCount() {
  const { user, isLoading: authLoading } = useAuth()

  return useQuery({
    queryKey: ['activeQuestCount'],
    queryFn: fetchActiveQuestCount,
    enabled: !!user && !authLoading,
  })
}
