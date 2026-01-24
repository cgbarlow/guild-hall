'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { evidenceSchema, type EvidenceFormData } from '@/lib/schemas/evidence.schema'
import type { Database } from '@/lib/types/database'

type UserObjectiveRow = Database['public']['Tables']['user_objectives']['Row']

export interface SubmitEvidenceOptions {
  onSuccess?: () => void
  onError?: (error: Error) => void
}

/**
 * Submit evidence for a user objective
 */
async function submitEvidence(data: EvidenceFormData): Promise<UserObjectiveRow> {
  // Validate the data
  const validation = evidenceSchema.safeParse(data)
  if (!validation.success) {
    throw new Error(validation.error.errors[0]?.message || 'Invalid evidence data')
  }

  const supabase = createClient()

  const updateData: {
    status: 'submitted'
    evidence_text?: string | null
    evidence_url?: string | null
    submitted_at: string
  } = {
    status: 'submitted',
    submitted_at: new Date().toISOString(),
  }

  if (data.evidenceText) {
    updateData.evidence_text = data.evidenceText
  }

  if (data.evidenceUrl) {
    updateData.evidence_url = data.evidenceUrl
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
 * React Query mutation hook for submitting evidence
 */
export function useSubmitEvidence(options?: SubmitEvidenceOptions) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: submitEvidence,
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['userObjectives'] })
      queryClient.invalidateQueries({ queryKey: ['userQuests'] })

      options?.onSuccess?.()
    },
    onError: (error: Error) => {
      options?.onError?.(error)
    },
  })
}
