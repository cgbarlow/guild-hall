'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/types/database'

type UserObjectiveRow = Database['public']['Tables']['user_objectives']['Row']
type UserRow = Database['public']['Tables']['users']['Row']
type QuestRow = Database['public']['Tables']['quests']['Row']
type ObjectiveRow = Database['public']['Tables']['objectives']['Row']
type UserQuestRow = Database['public']['Tables']['user_quests']['Row']

export interface SubmissionDetail extends UserObjectiveRow {
  user_quest: UserQuestRow & {
    user: UserRow | null
    quest: QuestRow | null
  }
  objective: ObjectiveRow | null
}

/**
 * Fetch a single submission with full details for review
 */
async function fetchSubmission(id: string): Promise<SubmissionDetail | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('user_objectives')
    .select(`
      *,
      user_quests!inner (
        *,
        users (*),
        quests (*)
      ),
      objectives (*)
    `)
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    throw error
  }

  if (!data) return null

  // Transform the data to match our interface
  const userQuests = data.user_quests as Record<string, unknown>
  return {
    ...data,
    user_quest: {
      ...userQuests,
      user: userQuests.users as SubmissionDetail['user_quest']['user'],
      quest: userQuests.quests as SubmissionDetail['user_quest']['quest'],
      users: undefined,
      quests: undefined,
    } as SubmissionDetail['user_quest'],
    objective: data.objectives as SubmissionDetail['objective'],
    user_quests: undefined,
    objectives: undefined,
  } as SubmissionDetail
}

/**
 * Fetch objective counts for a user quest
 */
async function fetchObjectiveCounts(userQuestId: string): Promise<{
  total: number
  completed: number
}> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('user_objectives')
    .select('id, status')
    .eq('user_quest_id', userQuestId)

  if (error) {
    throw error
  }

  const total = data?.length ?? 0
  const completed = data?.filter((o) => o.status === 'approved').length ?? 0

  return { total, completed }
}

/**
 * React Query hook for fetching a single submission
 */
export function useSubmission(id: string | undefined) {
  return useQuery({
    queryKey: ['submission', id],
    queryFn: () => fetchSubmission(id!),
    enabled: !!id,
  })
}

/**
 * React Query hook for fetching objective counts
 */
export function useObjectiveCounts(userQuestId: string | undefined) {
  return useQuery({
    queryKey: ['objectiveCounts', userQuestId],
    queryFn: () => fetchObjectiveCounts(userQuestId!),
    enabled: !!userQuestId,
  })
}
