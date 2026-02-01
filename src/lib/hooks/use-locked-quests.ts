'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/auth-context'
import type { QuestPrerequisite, QuestDifficulty } from '@/lib/types/quest'

interface LockedQuestData {
  quest_id: string
  incomplete_prerequisites: Array<{
    prerequisite_quest_id: string
    prerequisite_title: string
    prerequisite_difficulty: QuestDifficulty | null
  }>
}

export interface LockedQuestsMap {
  /** Check if a quest is locked */
  isLocked: (questId: string) => boolean
  /** Get incomplete prerequisites for a quest */
  getIncompletePrerequisites: (questId: string) => QuestPrerequisite[]
}

/**
 * Fetch all locked quests for the current user
 * Returns a map for quick lookup
 */
export function useLockedQuests() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['locked-quests', user?.id],
    queryFn: async (): Promise<LockedQuestsMap> => {
      if (!user?.id) {
        // No user - assume nothing is locked (will be checked on accept)
        return {
          isLocked: () => false,
          getIncompletePrerequisites: () => [],
        }
      }

      const supabase = createClient()
      const lockedMap = new Map<string, QuestPrerequisite[]>()

      try {
        const { data, error } = await (supabase.rpc as CallableFunction)(
          'get_user_locked_quests',
          { p_user_id: user.id }
        )

        if (error) {
          console.warn('get_user_locked_quests failed:', error.message)
          // Function might not exist yet, return empty map
          return {
            isLocked: () => false,
            getIncompletePrerequisites: () => [],
          }
        }

        // Build the map
        for (const row of (data as LockedQuestData[]) || []) {
          const prereqs: QuestPrerequisite[] = row.incomplete_prerequisites.map((p) => ({
            prerequisite_quest_id: p.prerequisite_quest_id,
            prerequisite_title: p.prerequisite_title,
            prerequisite_difficulty: p.prerequisite_difficulty,
            is_completed: false,
          }))
          lockedMap.set(row.quest_id, prereqs)
        }
      } catch {
        // Function doesn't exist yet
        console.warn('get_user_locked_quests not available')
      }

      return {
        isLocked: (questId: string) => lockedMap.has(questId),
        getIncompletePrerequisites: (questId: string) => lockedMap.get(questId) || [],
      }
    },
    enabled: true, // Always enabled, handles no-user case internally
    staleTime: 30000, // Cache for 30 seconds
  })
}
