'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export interface AbandonQuestOptions {
  onSuccess?: () => void
  onError?: (error: Error) => void
}

/**
 * Abandon a quest by updating the user_quest status to 'abandoned'
 */
async function abandonQuest(userQuestId: string): Promise<void> {
  const supabase = createClient()

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Not authenticated')
  }

  // Verify the user owns this quest and it's in an abandonable state
  const { data: userQuest, error: fetchError } = await (supabase
    .from('user_quests') as ReturnType<typeof supabase.from>)
    .select('id, user_id, status')
    .eq('id', userQuestId)
    .single()

  if (fetchError || !userQuest) {
    throw new Error('Quest not found')
  }

  const questData = userQuest as { id: string; user_id: string; status: string }

  if (questData.user_id !== user.id) {
    throw new Error('Not authorized to abandon this quest')
  }

  // Only allow abandoning quests that are in progress or accepted
  const abandonableStatuses = ['accepted', 'in_progress']
  if (!abandonableStatuses.includes(questData.status)) {
    throw new Error('This quest cannot be abandoned in its current state')
  }

  // Update the status to abandoned
  const { error: updateError } = await (supabase
    .from('user_quests') as ReturnType<typeof supabase.from>)
    .update({
      status: 'abandoned',
      abandoned_at: new Date().toISOString(),
    } as Record<string, unknown>)
    .eq('id', userQuestId)

  if (updateError) {
    throw new Error(updateError.message || 'Failed to abandon quest')
  }
}

/**
 * React Query mutation hook for abandoning quests
 */
export function useAbandonQuest(options?: AbandonQuestOptions) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: abandonQuest,
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['userQuests'] })
      queryClient.invalidateQueries({ queryKey: ['quests'] })

      options?.onSuccess?.()
    },
    onError: (error: Error) => {
      options?.onError?.(error)
    },
  })
}
