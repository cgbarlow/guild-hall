'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { UpdateQuestData } from '@/lib/schemas/quest.schema'
import type { Database } from '@/lib/types/database'

type QuestRow = Database['public']['Tables']['quests']['Row']
type QuestUpdate = Database['public']['Tables']['quests']['Update']

/**
 * Update an existing quest
 */
async function updateQuest({
  id,
  data,
}: {
  id: string
  data: UpdateQuestData
}): Promise<QuestRow> {
  const supabase = createClient()

  const updateData: QuestUpdate & { difficulty?: string; resources?: unknown; design_notes?: string | null; featured?: boolean } = {}

  if (data.title !== undefined) updateData.title = data.title
  if (data.description !== undefined) updateData.description = data.description
  if (data.category_id !== undefined) updateData.category_id = data.category_id
  if (data.points !== undefined) updateData.points = data.points
  if (data.reward_description !== undefined) updateData.reward_description = data.reward_description
  if (data.difficulty !== undefined) updateData.difficulty = data.difficulty
  if (data.resources !== undefined) updateData.resources = data.resources
  if (data.design_notes !== undefined) updateData.design_notes = data.design_notes
  if (data.acceptance_deadline !== undefined) updateData.acceptance_deadline = data.acceptance_deadline
  if (data.completion_days !== undefined) updateData.completion_days = data.completion_days
  if (data.narrative_context !== undefined) updateData.narrative_context = data.narrative_context
  if (data.transformation_goal !== undefined) updateData.transformation_goal = data.transformation_goal
  if (data.is_template !== undefined) updateData.is_template = data.is_template
  if (data.template_id !== undefined) updateData.template_id = data.template_id
  if (data.featured !== undefined) updateData.featured = data.featured

  const { data: quest, error } = await (supabase
    .from('quests') as ReturnType<typeof supabase.from>)
    .update(updateData as Record<string, unknown>)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw error
  }

  return quest as unknown as QuestRow
}

/**
 * React Query mutation hook for updating a quest
 */
export function useUpdateQuest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateQuest,
    onSuccess: (data) => {
      // Invalidate specific quest and list queries
      queryClient.invalidateQueries({ queryKey: ['quest', data.id] })
      queryClient.invalidateQueries({ queryKey: ['gm-quests'] })
      queryClient.invalidateQueries({ queryKey: ['quests'] })
    },
  })
}

/**
 * Publish a quest (change status from draft to published)
 */
async function publishQuest(id: string): Promise<QuestRow> {
  const supabase = createClient()

  const { data: quest, error } = await (supabase
    .from('quests') as ReturnType<typeof supabase.from>)
    .update({
      status: 'published',
      published_at: new Date().toISOString(),
    } as Record<string, unknown>)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw error
  }

  return quest as unknown as QuestRow
}

/**
 * Hook to publish a quest
 */
export function usePublishQuest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: publishQuest,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['quest', data.id] })
      queryClient.invalidateQueries({ queryKey: ['gm-quests'] })
      queryClient.invalidateQueries({ queryKey: ['quests'] })
    },
  })
}

/**
 * Archive a quest (change status to archived)
 */
async function archiveQuest(id: string): Promise<QuestRow> {
  const supabase = createClient()

  const { data: quest, error } = await (supabase
    .from('quests') as ReturnType<typeof supabase.from>)
    .update({
      status: 'archived',
      archived_at: new Date().toISOString(),
    } as Record<string, unknown>)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw error
  }

  return quest as unknown as QuestRow
}

/**
 * Hook to archive a quest
 */
export function useArchiveQuest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: archiveQuest,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['quest', data.id] })
      queryClient.invalidateQueries({ queryKey: ['gm-quests'] })
      queryClient.invalidateQueries({ queryKey: ['quests'] })
    },
  })
}

/**
 * Unpublish a quest (change status from published back to draft)
 */
async function unpublishQuest(id: string): Promise<QuestRow> {
  const supabase = createClient()

  const { data: quest, error } = await (supabase
    .from('quests') as ReturnType<typeof supabase.from>)
    .update({
      status: 'draft',
      published_at: null,
    } as Record<string, unknown>)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw error
  }

  return quest as unknown as QuestRow
}

/**
 * Hook to unpublish a quest
 */
export function useUnpublishQuest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: unpublishQuest,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['quest', data.id] })
      queryClient.invalidateQueries({ queryKey: ['gm-quests'] })
      queryClient.invalidateQueries({ queryKey: ['quests'] })
    },
  })
}

/**
 * Delete a quest
 */
async function deleteQuest(id: string): Promise<void> {
  const supabase = createClient()

  // First delete all objectives
  const { error: objError } = await (supabase
    .from('objectives') as ReturnType<typeof supabase.from>)
    .delete()
    .eq('quest_id', id)

  if (objError) {
    throw objError
  }

  // Then delete the quest
  const { error } = await (supabase
    .from('quests') as ReturnType<typeof supabase.from>)
    .delete()
    .eq('id', id)

  if (error) {
    throw error
  }
}

/**
 * Hook to delete a quest
 */
export function useDeleteQuest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteQuest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gm-quests'] })
      queryClient.invalidateQueries({ queryKey: ['quests'] })
    },
  })
}
