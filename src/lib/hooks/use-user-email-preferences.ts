'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { UserEmailPreferences } from '@/lib/types/engagement'

/**
 * Fetch user granular email preferences
 */
async function fetchUserEmailPreferences(userId: string): Promise<UserEmailPreferences | null> {
  const supabase = createClient()

  // Cast to any because user_email_preferences table isn't in generated types yet
  const { data, error } = await (supabase as any)
    .from('user_email_preferences')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data as UserEmailPreferences | null
}

/**
 * Hook to fetch user granular email preferences
 */
export function useUserEmailPreferences(userId: string | undefined) {
  return useQuery({
    queryKey: ['user-email-preferences', userId],
    queryFn: () => fetchUserEmailPreferences(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  })
}

/**
 * Update user granular email preferences
 */
async function updateUserEmailPreferences(
  data: Partial<UserEmailPreferences> & { user_id: string }
): Promise<UserEmailPreferences> {
  const supabase = createClient()

  const { user_id, ...updateData } = data

  // Cast to any because user_email_preferences table isn't in generated types yet
  const { data: updated, error } = await (supabase as any)
    .from('user_email_preferences')
    .upsert({
      user_id,
      ...updateData,
    })
    .select()
    .single()

  if (error) throw error
  return updated as UserEmailPreferences
}

export function useUpdateUserEmailPreferences() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateUserEmailPreferences,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user-email-preferences', variables.user_id] })
    },
  })
}
