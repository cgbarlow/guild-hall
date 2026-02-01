'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/auth-context'
import type { QuestPrerequisite, QuestDifficulty } from '@/lib/types/quest'
import { getDifficultyOrder } from '@/lib/types/quest'

/**
 * Fetch prerequisites for a quest with user completion status
 */
export function useQuestPrerequisites(questId: string | undefined) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['quest-prerequisites', questId, user?.id],
    queryFn: async (): Promise<QuestPrerequisite[]> => {
      if (!questId) return []
      const supabase = createClient()

      // Try to use the database function if available
      if (user?.id) {
        try {
          const { data, error } = await (supabase.rpc as CallableFunction)(
            'get_quest_prerequisites',
            { p_user_id: user.id, p_quest_id: questId }
          )

          if (!error && data) {
            const rpcResults = data as QuestPrerequisite[]
            // Sort by difficulty (easiest first)
            return rpcResults.sort((a, b) =>
              getDifficultyOrder(a.prerequisite_difficulty) - getDifficultyOrder(b.prerequisite_difficulty)
            )
          }
        } catch {
          // Function doesn't exist yet, fall through to fallback
        }
      }

      // Fallback: fetch prerequisites without user completion status
      const { data: prereqs, error: prereqsError } = await supabase
        .from('quest_prerequisites')
        .select(`
          prerequisite_quest_id,
          quests:prerequisite_quest_id (title, difficulty)
        `)
        .eq('quest_id', questId)

      if (prereqsError) {
        // Table might not exist yet
        console.warn('Prerequisites fetch failed:', prereqsError.message)
        return []
      }

      const results = (prereqs || []).map((p: { prerequisite_quest_id: string; quests: { title: string; difficulty: QuestDifficulty | null } | null }) => ({
        prerequisite_quest_id: p.prerequisite_quest_id,
        prerequisite_title: p.quests?.title || 'Unknown Quest',
        prerequisite_difficulty: p.quests?.difficulty || null,
        is_completed: false, // We don't know without user context
      }))

      // Sort by difficulty (easiest first)
      return results.sort((a, b) =>
        getDifficultyOrder(a.prerequisite_difficulty) - getDifficultyOrder(b.prerequisite_difficulty)
      )
    },
    enabled: !!questId,
  })
}

/**
 * Check if user can accept a specific quest (all prerequisites completed)
 */
export function useCanAcceptQuest(questId: string | undefined) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['can-accept-quest', questId, user?.id],
    queryFn: async (): Promise<boolean> => {
      if (!questId || !user?.id) return true // Assume can accept if no user
      const supabase = createClient()

      try {
        const { data, error } = await (supabase.rpc as CallableFunction)(
          'can_accept_quest',
          { p_user_id: user.id, p_quest_id: questId }
        )

        if (error) {
          // Function might not exist yet
          console.warn('can_accept_quest check failed:', error.message)
          return true
        }

        return data as boolean
      } catch {
        // Function doesn't exist yet
        return true
      }
    },
    enabled: !!questId && !!user?.id,
  })
}
