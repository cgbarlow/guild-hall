'use client'

import { useQuery } from '@tanstack/react-query'
import { getSubmissionById, getObjectiveCounts } from '@/lib/actions/evidence'
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
 * Uses server action to bypass RLS for GM access
 */
async function fetchSubmission(id: string): Promise<SubmissionDetail | null> {
  const submission = await getSubmissionById(id)

  if (!submission) {
    return null
  }

  // Transform PendingSubmissionData to SubmissionDetail format
  // The structures are compatible, just need type assertion
  return {
    id: submission.id,
    objective_id: submission.objective_id,
    user_quest_id: submission.user_quest_id,
    status: submission.status,
    evidence_text: submission.evidence_text,
    evidence_url: submission.evidence_url,
    submitted_at: submission.submitted_at,
    reviewed_by: submission.reviewed_by,
    reviewed_at: submission.reviewed_at,
    feedback: submission.feedback,
    created_at: submission.created_at,
    updated_at: submission.updated_at,
    user_quest: {
      id: submission.user_quest.id,
      user_id: submission.user_quest.user_id,
      quest_id: submission.user_quest.quest_id,
      status: submission.user_quest.status,
      user: submission.user_quest.user ? {
        id: submission.user_quest.user.id,
        display_name: submission.user_quest.user.display_name,
        email: submission.user_quest.user.email,
        total_points: submission.user_quest.user.total_points,
      } as UserRow : null,
      quest: submission.user_quest.quest ? {
        id: submission.user_quest.quest.id,
        title: submission.user_quest.quest.title,
        points: submission.user_quest.quest.points,
      } as QuestRow : null,
    } as SubmissionDetail['user_quest'],
    objective: submission.objective ? {
      id: submission.objective.id,
      title: submission.objective.title,
      description: submission.objective.description,
      points: submission.objective.points,
      evidence_type: submission.objective.evidence_type,
    } as ObjectiveRow : null,
  } as SubmissionDetail
}

/**
 * Fetch objective counts for a user quest (uses server action for GM access)
 */
async function fetchObjectiveCounts(userQuestId: string): Promise<{
  total: number
  completed: number
}> {
  return getObjectiveCounts(userQuestId)
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
