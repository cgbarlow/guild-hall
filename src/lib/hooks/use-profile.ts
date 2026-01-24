'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'
import type { UpdateProfileData } from '@/lib/schemas/profile.schema'

type Profile = Database['public']['Tables']['profiles']['Row']

export function useProfile() {
  const supabase = createClient()
  return useQuery({
    queryKey: ['profile'],
    queryFn: async (): Promise<Profile | null> => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null
      const { data, error } = await supabase.from('profiles').select('*').eq('user_id', user.id).single()
      if (error) throw new Error(error.message)
      return data
    },
  })
}

export function useUpdateProfile() {
  const supabase = createClient()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (profileData: UpdateProfileData): Promise<Profile> => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')
      const { data, error } = await supabase.from('profiles').update({ ...profileData, updated_at: new Date().toISOString() }).eq('user_id', user.id).select().single()
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['profile'] }) },
  })
}
