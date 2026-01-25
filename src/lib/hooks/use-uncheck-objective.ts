'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { uncheckObjective, type UncheckObjectiveResult } from '@/lib/actions/objective'

/**
 * Hook to uncheck (reset) an objective
 * Handles optimistic updates and cache invalidation
 */
export function useUncheckObjective() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userObjectiveId: string): Promise<UncheckObjectiveResult> => {
      return await uncheckObjective(userObjectiveId)
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['userObjectives'] })
      queryClient.invalidateQueries({ queryKey: ['userQuests'] })
    },
  })
}
