'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

// Type for the query result
interface UserQuestResult {
  id: string
  quest_id: string
  status: string
}

/**
 * Fetch the quest IDs that the current user is taking (active or completed)
 */
async function fetchUserQuestIds(userId: string): Promise<{ questId: string; userQuestId: string; status: string }[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('user_quests')
    .select('id, quest_id, status')
    .eq('user_id', userId)
    .in('status', ['accepted', 'in_progress', 'completed'])

  if (error) {
    console.error('Error fetching user quest IDs:', error)
    return []
  }

  return ((data || []) as unknown as UserQuestResult[]).map((item) => ({
    questId: item.quest_id,
    userQuestId: item.id,
    status: item.status,
  }))
}

export interface UserQuestMap {
  /** Map of questId -> userQuestId for active quests */
  activeQuestIds: Map<string, string>
  /** Set of questIds that user has completed */
  completedQuestIds: Set<string>
  /** Check if quest is completed */
  isCompleted: (questId: string) => boolean
  /** Get userQuestId for active quest */
  getActiveUserQuestId: (questId: string) => string | undefined
}

/**
 * Hook to get the quest IDs that the current user is taking
 * Returns maps for both active and completed quests
 */
export function useUserActiveQuestIds() {
  return useQuery({
    queryKey: ['userQuestIds'],
    queryFn: async (): Promise<UserQuestMap> => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        return {
          activeQuestIds: new Map<string, string>(),
          completedQuestIds: new Set<string>(),
          isCompleted: () => false,
          getActiveUserQuestId: () => undefined,
        }
      }

      const userQuests = await fetchUserQuestIds(user.id)

      const activeQuestIds = new Map<string, string>()
      const completedQuestIds = new Set<string>()

      for (const q of userQuests) {
        if (q.status === 'completed') {
          completedQuestIds.add(q.questId)
        } else {
          activeQuestIds.set(q.questId, q.userQuestId)
        }
      }

      return {
        activeQuestIds,
        completedQuestIds,
        isCompleted: (questId: string) => completedQuestIds.has(questId),
        getActiveUserQuestId: (questId: string) => activeQuestIds.get(questId),
      }
    },
  })
}
