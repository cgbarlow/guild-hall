'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'
import type { PrivacySettingsFormData } from '@/lib/schemas/privacy.schema'

type PrivacySettings = Database['public']['Tables']['privacy_settings']['Row']

export function usePrivacySettings() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['privacy-settings'],
    queryFn: async (): Promise<PrivacySettings | null> => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data: rawData, error } = await supabase
        .from('privacy_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) throw new Error(error.message)
      return rawData as unknown as PrivacySettings
    },
  })
}

export function useUpdatePrivacySettings() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (settings: PrivacySettingsFormData): Promise<PrivacySettings> => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data: rawData, error } = await (supabase
        .from('privacy_settings') as ReturnType<typeof supabase.from>)
        .update({
          ...settings,
          updated_at: new Date().toISOString(),
        } as Record<string, unknown>)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw new Error(error.message)
      return rawData as unknown as PrivacySettings
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['privacy-settings'] })
    },
  })
}
