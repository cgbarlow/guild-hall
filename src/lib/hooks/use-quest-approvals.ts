'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/auth-context'
import {
  getPendingQuestApprovals,
  gmReviewQuestCompletion,
  type PendingQuestApproval,
  type GMReviewResult,
} from '@/lib/actions/quest-completion'

/**
 * Hook to fetch pending quest approvals for GM review
 */
export function usePendingQuestApprovals() {
  const { user, isLoading: authLoading } = useAuth()

  return useQuery({
    queryKey: ['pendingQuestApprovals', user?.id],
    queryFn: async (): Promise<PendingQuestApproval[]> => {
      const result = await getPendingQuestApprovals()
      return result
    },
    enabled: !!user && !authLoading,
  })
}

/**
 * Hook to approve or reject a quest completion
 */
export function useReviewQuestCompletion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      userQuestId,
      approved,
      feedback,
    }: {
      userQuestId: string
      approved: boolean
      feedback?: string
    }): Promise<GMReviewResult> => {
      return await gmReviewQuestCompletion(userQuestId, approved, feedback)
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['pendingQuestApprovals'] })
      queryClient.invalidateQueries({ queryKey: ['userQuests'] })
    },
  })
}
