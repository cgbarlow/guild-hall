'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { claimQuestReward, type ClaimQuestResult } from '@/lib/actions/quest-completion'

/**
 * Hook to claim a quest reward
 * Handles optimistic updates and cache invalidation
 */
export function useClaimQuest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userQuestId: string): Promise<ClaimQuestResult> => {
      return await claimQuestReward(userQuestId)
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['userQuests'] })
      queryClient.invalidateQueries({ queryKey: ['userObjectives'] })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] })
    },
  })
}
