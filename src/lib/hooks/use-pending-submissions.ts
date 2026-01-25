'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/auth-context'
import { getPendingSubmissions, type PendingSubmissionData } from '@/lib/actions/evidence'

export type PendingSubmission = PendingSubmissionData

export interface UsePendingSubmissionsOptions {
  questId?: string
  enabled?: boolean
}

/**
 * React Query hook for fetching pending submissions for GM review
 */
export function usePendingSubmissions(options: UsePendingSubmissionsOptions = {}) {
  const { questId, enabled = true } = options
  const { user, isLoading: authLoading } = useAuth()

  return useQuery({
    queryKey: ['pendingSubmissions', questId, user?.id],
    queryFn: async () => {
      const result = await getPendingSubmissions(questId)
      console.log('Pending submissions fetched:', result.length, 'items')
      return result
    },
    // Only run query when user is authenticated and explicitly enabled
    enabled: enabled && !!user && !authLoading,
  })
}

/**
 * Get submission status display info
 */
export function getSubmissionStatusInfo(status: string): {
  label: string
  color: string
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
} {
  const statusMap: Record<string, { label: string; color: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    locked: { label: 'Locked', color: 'bg-gray-500', variant: 'outline' },
    available: { label: 'Available', color: 'bg-blue-500', variant: 'secondary' },
    submitted: { label: 'Pending Review', color: 'bg-amber-500', variant: 'default' },
    approved: { label: 'Approved', color: 'bg-green-500', variant: 'default' },
    rejected: { label: 'Rejected', color: 'bg-red-500', variant: 'destructive' },
  }

  return statusMap[status] || { label: status, color: 'bg-gray-500', variant: 'outline' }
}
