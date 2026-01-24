'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/types/database'

type UserQuestRow = Database['public']['Tables']['user_quests']['Row']

export interface ExtensionRequestData {
  userQuestId: string
  reason: string
}

export interface RequestExtensionOptions {
  onSuccess?: () => void
  onError?: (error: Error) => void
}

/**
 * Request a deadline extension for a user quest
 */
async function requestExtension(data: ExtensionRequestData): Promise<UserQuestRow> {
  if (!data.reason || data.reason.trim().length < 10) {
    throw new Error('Please provide a reason with at least 10 characters')
  }

  if (data.reason.length > 500) {
    throw new Error('Reason must be less than 500 characters')
  }

  const supabase = createClient()

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Not authenticated')
  }

  // Update user_quests with extension request
  const { data: updatedQuest, error } = await (supabase
    .from('user_quests') as ReturnType<typeof supabase.from>)
    .update({
      extension_requested: true,
      extension_requested_at: new Date().toISOString(),
      extension_reason: data.reason.trim(),
    } as Record<string, unknown>)
    .eq('id', data.userQuestId)
    .eq('user_id', user.id) // Ensure user owns this quest
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  if (!updatedQuest) {
    throw new Error('Quest not found or you do not have permission')
  }

  return updatedQuest as UserQuestRow
}

/**
 * React Query mutation hook for requesting deadline extensions
 */
export function useRequestExtension(options?: RequestExtensionOptions) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: requestExtension,
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['userQuests'] })
      queryClient.invalidateQueries({ queryKey: ['userQuest', data.id] })

      options?.onSuccess?.()
    },
    onError: (error: Error) => {
      options?.onError?.(error)
    },
  })
}
