'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/types/database'

type UserObjectiveRow = Database['public']['Tables']['user_objectives']['Row']

export interface ApproveSubmissionData {
  userObjectiveId: string
  feedback?: string
}

export interface RejectSubmissionData {
  userObjectiveId: string
  feedback: string
}

export interface ReviewSubmissionOptions {
  onSuccess?: () => void
  onError?: (error: Error) => void
}

/**
 * Approve a submission
 */
async function approveSubmission(data: ApproveSubmissionData): Promise<UserObjectiveRow> {
  const supabase = createClient()

  // Get current user (GM)
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Not authenticated')
  }

  const updateData: {
    status: 'approved'
    reviewed_by: string
    reviewed_at: string
    feedback?: string
  } = {
    status: 'approved',
    reviewed_by: user.id,
    reviewed_at: new Date().toISOString(),
  }

  if (data.feedback) {
    updateData.feedback = data.feedback
  }

  const { data: updatedObjective, error } = await supabase
    .from('user_objectives')
    .update(updateData)
    .eq('id', data.userObjectiveId)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return updatedObjective
}

/**
 * Reject a submission
 */
async function rejectSubmission(data: RejectSubmissionData): Promise<UserObjectiveRow> {
  if (!data.feedback || data.feedback.trim() === '') {
    throw new Error('Feedback is required when rejecting a submission')
  }

  const supabase = createClient()

  // Get current user (GM)
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Not authenticated')
  }

  const { data: updatedObjective, error } = await supabase
    .from('user_objectives')
    .update({
      status: 'rejected',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      feedback: data.feedback.trim(),
    })
    .eq('id', data.userObjectiveId)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return updatedObjective
}

/**
 * React Query hook for reviewing submissions
 */
export function useReviewSubmission(options?: ReviewSubmissionOptions) {
  const queryClient = useQueryClient()

  const approveMutation = useMutation({
    mutationFn: approveSubmission,
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['pendingSubmissions'] })
      queryClient.invalidateQueries({ queryKey: ['submission'] })
      queryClient.invalidateQueries({ queryKey: ['userObjectives'] })

      options?.onSuccess?.()
    },
    onError: (error: Error) => {
      options?.onError?.(error)
    },
  })

  const rejectMutation = useMutation({
    mutationFn: rejectSubmission,
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['pendingSubmissions'] })
      queryClient.invalidateQueries({ queryKey: ['submission'] })
      queryClient.invalidateQueries({ queryKey: ['userObjectives'] })

      options?.onSuccess?.()
    },
    onError: (error: Error) => {
      options?.onError?.(error)
    },
  })

  return {
    approveSubmission: approveMutation.mutateAsync,
    rejectSubmission: rejectMutation.mutateAsync,
    isApproving: approveMutation.isPending,
    isRejecting: rejectMutation.isPending,
    isPending: approveMutation.isPending || rejectMutation.isPending,
    approveError: approveMutation.error,
    rejectError: rejectMutation.error,
  }
}
