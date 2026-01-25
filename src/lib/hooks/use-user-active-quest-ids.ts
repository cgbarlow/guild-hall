'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

// Type for the query result
interface UserQuestResult {
  id: string
  quest_id: string
}

/**
 * Fetch the quest IDs that the current user is actively taking
 */
async function fetchUserActiveQuestIds(userId: string): Promise<{ questId: string; userQuestId: string }[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('user_quests')
    .select('id, quest_id')
    .eq('user_id', userId)
    .in('status', ['accepted', 'in_progress'])

  if (error) {
    console.error('Error fetching active quest IDs:', error)
    return []
  }

  return ((data || []) as unknown as UserQuestResult[]).map((item) => ({
    questId: item.quest_id,
    userQuestId: item.id,
  }))
}

/**
 * Hook to get the quest IDs that the current user is actively taking
 * Returns a map of questId -> userQuestId for quick lookup
 */
export function useUserActiveQuestIds() {
  return useQuery({
    queryKey: ['userActiveQuestIds'],
    queryFn: async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        return new Map<string, string>()
      }

      const activeQuests = await fetchUserActiveQuestIds(user.id)
      return new Map(activeQuests.map((q) => [q.questId, q.userQuestId]))
    },
  })
}
