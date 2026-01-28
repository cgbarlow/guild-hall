'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/types/database'

export interface AcceptQuestOptions {
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export interface AcceptQuestParams {
  questId: string
  exclusiveCode?: string
}

export type UserQuest = Database['public']['Tables']['user_quests']['Row']

/**
 * Accept a quest by creating a user_quests entry
 * @param params - Either a questId string or an AcceptQuestParams object
 */
async function acceptQuest(params: string | AcceptQuestParams): Promise<UserQuest> {
  const questId = typeof params === 'string' ? params : params.questId
  const exclusiveCode = typeof params === 'string' ? undefined : params.exclusiveCode
  const supabase = createClient()

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Not authenticated')
  }

  // Check if quest is exclusive and validate code
  const { data: quest, error: questError } = await supabase
    .from('quests')
    .select('is_exclusive, exclusive_code')
    .eq('id', questId)
    .single()

  if (questError || !quest) {
    throw new Error('Quest not found')
  }

  // Type assertion for the query result
  const questData = quest as { is_exclusive: boolean | null; exclusive_code: string | null }

  // Validate exclusive code if quest is exclusive
  if (questData.is_exclusive) {
    if (!exclusiveCode) {
      throw new Error('This is an exclusive quest. Please enter the unlock code.')
    }
    if (questData.exclusive_code !== exclusiveCode) {
      throw new Error('Invalid unlock code. Please check and try again.')
    }
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
