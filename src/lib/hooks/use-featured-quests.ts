'use client'

import { useQuery } from '@tanstack/react-query'
import { getPublishedQuests } from '@/lib/actions/quests'

/**
 * React Query hook to fetch featured published quests
 */
export function useFeaturedQuests() {
  return useQuery({
    queryKey: ['quests', 'featured'],
    queryFn: () => getPublishedQuests({ featured: true }),
  })
}
