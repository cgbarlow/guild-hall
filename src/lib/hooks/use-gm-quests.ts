'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/auth-context'
import { getGMQuests } from '@/lib/actions/quests'
import type { Quest, GMQuestFilters } from '@/lib/types/quest'

/**
 * Fetch all quests for GM view using server action (bypasses RLS)
 */
async function fetchGMQuests(filters?: GMQuestFilters): Promise<Quest[]> {
  const quests = await getGMQuests()

  // Apply filters client-side (server action returns all quests)
  let filtered = quests

  if (filters?.status) {
    const statuses = Array.isArray(filters.status) ? filters.status : [filters.status]
    filtered = filtered.filter(q => statuses.includes(q.status))
  }

  if (filters?.category_id) {
    filtered = filtered.filter(q => q.category_id === filters.category_id)
  }

  if (filters?.search) {
    const search = filters.search.toLowerCase()
    filtered = filtered.filter(q => q.title.toLowerCase().includes(search))
  }

  if (filters?.created_by) {
    filtered = filtered.filter(q => q.created_by === filters.created_by)
  }

  if (filters?.is_template !== undefined) {
    filtered = filtered.filter(q => q.is_template === filters.is_template)
  } else {
    filtered = filtered.filter(q => !q.is_template)
  }

  return filtered
}

/**
 * React Query hook to fetch all quests for GM management
 * Unlike useQuests, this includes draft, published, and archived quests
 * Server action handles authorization
 */
export function useGMQuests(filters?: GMQuestFilters) {
  const { user, isLoading: authLoading } = useAuth()

  return useQuery({
    queryKey: ['gm-quests', filters, user?.id],
    queryFn: async () => {
      try {
        return await fetchGMQuests(filters)
      } catch (error) {
        // Log error but return empty array for graceful degradation
        console.error('Error fetching GM quests:', error)
        return []
      }
    },
    // Only run query when user is authenticated
    enabled: !!user && !authLoading,
  })
}

/**
 * Get counts of quests by status for dashboard
 */
export function useGMQuestCounts() {
  const { data: quests, ...rest } = useGMQuests()

  const counts = {
    draft: quests?.filter((q) => q.status === 'draft').length ?? 0,
    published: quests?.filter((q) => q.status === 'published').length ?? 0,
    archived: quests?.filter((q) => q.status === 'archived').length ?? 0,
    total: quests?.length ?? 0,
  }

  return {
    ...rest,
    data: counts,
  }
}
