'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

// Type for the query result
interface ObjectiveQueryResult {
  id: string
  status: string
  objectives: {
    evidence_required: boolean
  } | null
}

/**
 * Mark a user objective as complete (for objectives that don't require evidence)
 * This auto-approves the objective since no GM review is needed
 */
async function markObjectiveComplete(userObjectiveId: string): Promise<void> {
  const supabase = createClient()

  // First verify the objective doesn't require evidence
  const { data: rawData, error: fetchError } = await supabase
    .from('user_objectives')
    .select(`
      id,
      status,
      objectives (
        evidence_required
      )
    `)
    .eq('id', userObjectiveId)
    .single()

  if (fetchError || !rawData) {
    throw new Error('Failed to fetch objective')
  }

  const objective = rawData as unknown as ObjectiveQueryResult

  if (objective.objectives?.evidence_required) {
    throw new Error('This objective requires evidence submission')
  }

  if (objective.status !== 'available') {
    throw new Error('This objective is not available for completion')
  }

  // Mark as approved directly (no evidence needed = auto-approved)
  const { error: updateError } = await (supabase
    .from('user_objectives') as ReturnType<typeof supabase.from>)
    .update({
      status: 'approved',
      reviewed_at: new Date().toISOString(),
    } as Record<string, unknown>)
    .eq('id', userObjectiveId)

  if (updateError) {
    throw new Error(updateError.message)
  }
}

/**
 * React Query mutation hook for marking objectives complete
 */
export function useMarkObjectiveComplete() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: markObjectiveComplete,
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['userObjectives'] })
      queryClient.invalidateQueries({ queryKey: ['userQuests'] })
    },
  })
}
