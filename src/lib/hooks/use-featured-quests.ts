'use client'

import { useQuery } from '@tanstack/react-query'
import { getPublishedQuests } from '@/lib/actions/quests'
import { getDifficultyOrder } from '@/lib/types/quest'

/**
 * React Query hook to fetch featured published quests
 */
export function useFeaturedQuests() {
  return useQuery({
    queryKey: ['quests', 'featured'],
    queryFn: async () => {
      const quests = await getPublishedQuests({ featured: true })
      // Sort by difficulty (easiest first)
      quests.sort((a, b) => getDifficultyOrder(a.difficulty) - getDifficultyOrder(b.difficulty))
      return quests
    },
  })
}
