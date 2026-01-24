'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/types/database'

export interface AcceptQuestOptions {
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export type UserQuest = Database['public']['Tables']['user_quests']['Row']

/**
 * Accept a quest by creating a user_quests entry
 */
async function acceptQuest(questId: string): Promise<UserQuest> {
  const supabase = createClient()

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Not authenticated')
  }

  // Insert into user_quests with 'accepted' status
  // Type assertion to bypass Supabase type inference issues
  const { data: userQuest, error: insertError } = await (supabase
    .from('user_quests') as ReturnType<typeof supabase.from>)
    .insert({
      user_id: user.id,
      quest_id: questId,
      status: 'accepted',
      accepted_at: new Date().toISOString(),
    } as Record<string, unknown>)
    .select()
    .single()

  if (insertError || !userQuest) {
    throw new Error(insertError?.message || 'Failed to accept quest')
  }

  return userQuest as UserQuest
}

/**
 * React Query mutation hook for accepting quests
 */
export function useAcceptQuest(options?: AcceptQuestOptions) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: acceptQuest,
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['quest', data.quest_id] })
      queryClient.invalidateQueries({ queryKey: ['quests'] })
      queryClient.invalidateQueries({ queryKey: ['userQuests'] })

      options?.onSuccess?.()
    },
    onError: (error: Error) => {
      options?.onError?.(error)
    },
  })
}
