'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/types/database'

type UserQuest = Database['public']['Tables']['user_quests']['Row']
type Quest = Database['public']['Tables']['quests']['Row']
type User = Database['public']['Tables']['users']['Row']

/**
 * Extension request with related quest and user info
 */
export interface ExtensionRequest {
  id: string
  user_quest_id: string
  user_id: string
  quest_id: string
  quest_title: string
  user_display_name: string | null
  user_email: string
  extension_reason: string | null
  extension_requested_at: string | null
  current_deadline: string | null
  status: UserQuest['status']
}

/**
 * Fetch pending extension requests
 */
async function fetchExtensionRequests(): Promise<ExtensionRequest[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('user_quests')
    .select(`
      id,
      user_id,
      quest_id,
      extension_reason,
      extension_requested_at,
      deadline,
      status,
      quests (title),
      users!user_quests_user_id_fkey (display_name, email)
    `)
    .eq('extension_requested', true)
    .is('extension_granted', null)
    .order('extension_requested_at', { ascending: true })

  if (error) {
    throw error
  }

  return (data || []).map((item) => {
    const quest = item.quests as unknown as Quest | null
    const user = item.users as unknown as User | null

    return {
      id: item.id,
      user_quest_id: item.id,
      user_id: item.user_id,
      quest_id: item.quest_id,
      quest_title: quest?.title || 'Unknown Quest',
      user_display_name: user?.display_name || null,
      user_email: user?.email || 'unknown@example.com',
      extension_reason: item.extension_reason,
      extension_requested_at: item.extension_requested_at,
      current_deadline: item.deadline,
      status: item.status,
    }
  })
}

/**
 * Hook to fetch pending extension requests
 */
export function useExtensionRequests() {
  return useQuery({
    queryKey: ['extension-requests'],
    queryFn: fetchExtensionRequests,
  })
}

interface ReviewExtensionParams {
  userQuestId: string
  approved: boolean
  newDeadline?: string
}

/**
 * Review an extension request (approve or deny)
 */
async function reviewExtension({
  userQuestId,
  approved,
  newDeadline,
}: ReviewExtensionParams): Promise<void> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  const updateData: Partial<UserQuest> = {
    extension_granted: approved,
    extension_decided_by: user.id,
    extension_decided_at: new Date().toISOString(),
  }

  if (approved && newDeadline) {
    updateData.extended_deadline = newDeadline
    updateData.deadline = newDeadline
  }

  const { error } = await supabase
    .from('user_quests')
    .update(updateData)
    .eq('id', userQuestId)

  if (error) {
    throw error
  }
}

/**
 * Hook to review (approve/deny) an extension request
 */
export function useReviewExtension() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: reviewExtension,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['extension-requests'] })
      queryClient.invalidateQueries({ queryKey: ['user-quests'] })
    },
  })
}
