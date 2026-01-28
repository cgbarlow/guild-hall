'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/types/database'

export interface AcceptQuestOptions {
  onSuccess?: (userQuest: UserQuest) => void
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

  // Check if user already has this quest (might be abandoned/expired)
  const { data: existingQuest } = await (supabase
    .from('user_quests') as ReturnType<typeof supabase.from>)
    .select('id, status')
    .eq('user_id', user.id)
    .eq('quest_id', questId)
    .single()

  const existing = existingQuest as { id: string; status: string } | null

  if (existing) {
    // If quest was abandoned or expired, re-accept it
    if (existing.status === 'abandoned' || existing.status === 'expired') {
      const { data: updatedQuest, error: updateError } = await (supabase
        .from('user_quests') as ReturnType<typeof supabase.from>)
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
          abandoned_at: null,
          started_at: null,
          completed_at: null,
        } as Record<string, unknown>)
        .eq('id', existing.id)
        .select()
        .single()

      if (updateError || !updatedQuest) {
        throw new Error(updateError?.message || 'Failed to re-accept quest')
      }

      return updatedQuest as UserQuest
    }

    // Quest is already active
    throw new Error('You have already accepted this quest')
  }

  // Insert new user_quest with 'accepted' status
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
    onSuccess: async (data) => {
      // Invalidate and refetch user quests before redirecting
      // This prevents the "Quest not found" flash on the destination page
      await queryClient.invalidateQueries({ queryKey: ['userQuests'] })
      await queryClient.refetchQueries({ queryKey: ['userQuests'] })
      queryClient.invalidateQueries({ queryKey: ['quest', data.quest_id] })
      queryClient.invalidateQueries({ queryKey: ['quests'] })

      options?.onSuccess?.(data)
    },
    onError: (error: Error) => {
      options?.onError?.(error)
    },
  })
}
