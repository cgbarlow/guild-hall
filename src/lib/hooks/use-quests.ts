'use client'

import { useQuery } from '@tanstack/react-query'
import { getPublishedQuests } from '@/lib/actions/quests'
import type { Quest, QuestFilters } from '@/lib/types/quest'
import { getDifficultyOrder } from '@/lib/types/quest'

/**
 * Fetch quests using server action (bypasses RLS)
 */
async function fetchQuests(filters?: QuestFilters): Promise<Quest[]> {
  let quests = await getPublishedQuests({
    category_id: filters?.category_id ?? undefined,
    search: filters?.search ?? undefined,
  })

  // Apply difficulty filter client-side
  if (filters?.difficulty) {
    quests = quests.filter(q => q.difficulty === filters.difficulty)
  }

  // Sort by difficulty (easiest first)
  quests.sort((a, b) => getDifficultyOrder(a.difficulty) - getDifficultyOrder(b.difficulty))

  return quests
}

/**
 * React Query hook to fetch quests with optional filters
 */
export function useQuests(filters?: QuestFilters) {
  return useQuery({
    queryKey: ['quests', filters],
    queryFn: () => fetchQuests(filters),
  })
}

/**
 * Hook to get available quests (published and not templates)
 */
export function useAvailableQuests(userId?: string, filters?: QuestFilters) {
  const questsQuery = useQuests(filters)

  // For now, return all published quests
  // User-specific filtering (already accepted, etc) will be added later
  const availableQuests = questsQuery.data?.filter(
    (quest) => quest.status === 'published'
  )

  return {
    ...questsQuery,
    data: availableQuests,
  }
}
