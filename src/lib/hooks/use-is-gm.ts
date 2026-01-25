'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/auth-context'

/**
 * Hook to check if the current user has GM or admin role
 */
export function useIsGm() {
  const { user } = useAuth()
  const supabase = createClient()

  return useQuery({
    queryKey: ['isGm', user?.id],
    queryFn: async () => {
      if (!user) return false

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)

      if (error) {
        console.error('Error checking GM status:', error)
        return false
      }

      const roles = data as { role: string }[] | null
      return roles?.some(r => r.role === 'gm' || r.role === 'admin') ?? false
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  })
}
