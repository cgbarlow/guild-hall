'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { QuestFormData } from '@/lib/schemas/quest.schema'
import type { Database } from '@/lib/types/database'

type QuestRow = Database['public']['Tables']['quests']['Row']
type QuestInsert = Database['public']['Tables']['quests']['Insert']

/**
 * Create a new quest in the database
 */
async function createQuest(data: QuestFormData): Promise<QuestRow> {
  const supabase = createClient()

  // Get the current user (must be authenticated)
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) {
    throw new Error('You must be logged in to create a quest')
  }

  // Prepare the quest data for insertion
  const questData: QuestInsert = {
    title: data.title,
    description: data.description ?? null,
    category_id: data.category_id ?? null,
    points: data.points ?? 100,
    reward_description: data.reward_description ?? null,
    acceptance_deadline: data.acceptance_deadline ?? null,
    completion_days: data.completion_days ?? null,
    narrative_context: data.narrative_context ?? null,
    transformation_goal: data.transformation_goal ?? null,
    is_template: data.is_template ?? false,
    template_id: data.template_id ?? null,
    created_by: userData.user.id,
    status: 'draft', // New quests always start as drafts
  }

  // Insert the quest
  const { data: quest, error } = await supabase
    .from('quests')
    .insert(questData)
    .select()
    .single()

  if (error) {
    throw error
  }

  return quest
}

/**
 * React Query mutation hook for creating a quest
 */
export function useCreateQuest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createQuest,
    onSuccess: () => {
      // Invalidate GM quests list to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['gm-quests'] })
    },
  })
}
