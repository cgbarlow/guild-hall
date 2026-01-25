'use client'

import { useQuery } from '@tanstack/react-query'
import { getQuestById } from '@/lib/actions/quests'
import type { QuestWithRelations } from '@/lib/types/quest'

/**
 * Fetch a single quest by ID with its objectives using server action
 */
async function fetchQuest(questId: string): Promise<QuestWithRelations | null> {
  return getQuestById(questId)
}

/**
 * React Query hook to fetch a single quest by ID
 */
export function useQuest(questId: string | undefined) {
  return useQuery({
    queryKey: ['quest', questId],
    queryFn: () => fetchQuest(questId!),
    enabled: !!questId,
  })
}
