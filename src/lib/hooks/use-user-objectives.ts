'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/types/database'

type UserObjectiveRow = Database['public']['Tables']['user_objectives']['Row']
type ObjectiveRow = Database['public']['Tables']['objectives']['Row']
type UserObjectiveStatus = UserObjectiveRow['status']

export interface UserObjectiveWithDetails extends UserObjectiveRow {
  objective: Pick<
    ObjectiveRow,
    'id' | 'quest_id' | 'title' | 'description' | 'points' | 'display_order' | 'depends_on_id' | 'evidence_required' | 'evidence_type'
  > | null
}

/**
 * Fetch user objectives for a specific user quest
 */
async function fetchUserObjectives(userQuestId: string): Promise<UserObjectiveWithDetails[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('user_objectives')
    .select(`
      *,
      objectives (
        id,
        quest_id,
        title,
        description,
        points,
        display_order,
        depends_on_id,
        evidence_required,
        evidence_type
      )
    `)
    .eq('user_quest_id', userQuestId)
    .order('objectives(display_order)', { ascending: true })

  if (error) {
    throw error
  }

  // Transform the data to match our interface
  return (data || []).map((item) => ({
    ...item,
    objective: item.objectives as UserObjectiveWithDetails['objective'],
    objectives: undefined,
  })) as UserObjectiveWithDetails[]
}

/**
 * React Query hook to fetch user objectives for a quest
 */
export function useUserObjectives(userQuestId: string | undefined) {
  return useQuery({
    queryKey: ['userObjectives', userQuestId],
    queryFn: () => fetchUserObjectives(userQuestId!),
    enabled: !!userQuestId,
  })
}

/**
 * Get status display info for user objectives
 */
export function getUserObjectiveStatusInfo(status: UserObjectiveStatus): {
  label: string
  color: string
  icon: 'lock' | 'circle' | 'clock' | 'check' | 'x'
} {
  const statusMap: Record<UserObjectiveStatus, { label: string; color: string; icon: 'lock' | 'circle' | 'clock' | 'check' | 'x' }> = {
    locked: { label: 'Locked', color: 'text-muted-foreground', icon: 'lock' },
    available: { label: 'Available', color: 'text-foreground', icon: 'circle' },
    submitted: { label: 'Pending Review', color: 'text-amber-500', icon: 'clock' },
    approved: { label: 'Approved', color: 'text-green-500', icon: 'check' },
    rejected: { label: 'Rejected', color: 'text-red-500', icon: 'x' },
  }

  return statusMap[status] || { label: status, color: 'text-muted-foreground', icon: 'circle' }
}

/**
 * Check if an objective can be unlocked based on dependencies
 */
export function canUnlockObjective(
  objectiveId: string,
  objectives: UserObjectiveWithDetails[]
): boolean {
  const objective = objectives.find((o) => o.objective_id === objectiveId)
  if (!objective?.objective?.depends_on_id) {
    return true // No dependency, can be unlocked
  }

  // Find the dependency and check if it's approved
  const dependency = objectives.find(
    (o) => o.objective_id === objective.objective?.depends_on_id
  )

  return dependency?.status === 'approved'
}
