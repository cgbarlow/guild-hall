'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Objective } from '@/lib/types/quest'
import type { CreateObjectiveData, ObjectiveFormData } from '@/lib/schemas/quest.schema'
import type { Database } from '@/lib/types/database'

type ObjectiveRow = Database['public']['Tables']['objectives']['Row']
type ObjectiveInsert = Database['public']['Tables']['objectives']['Insert']
type ObjectiveUpdate = Database['public']['Tables']['objectives']['Update']

/**
 * Fetch objectives for a quest
 */
async function fetchObjectives(questId: string): Promise<Objective[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('objectives')
    .select('*')
    .eq('quest_id', questId)
    .order('display_order', { ascending: true })

  if (error) {
    throw error
  }

  return data || []
}

/**
 * Hook to fetch objectives for a quest
 */
export function useObjectives(questId: string) {
  return useQuery({
    queryKey: ['objectives', questId],
    queryFn: () => fetchObjectives(questId),
    enabled: !!questId,
  })
}

/**
 * Create a new objective
 */
async function createObjective(data: CreateObjectiveData): Promise<ObjectiveRow> {
  const supabase = createClient()

  const objectiveData: ObjectiveInsert = {
    quest_id: data.quest_id,
    title: data.title,
    description: data.description ?? null,
    points: data.points ?? 10,
    display_order: data.display_order ?? 0,
    depends_on_id: data.depends_on_id ?? null,
    evidence_required: data.evidence_required ?? false,
    evidence_type: data.evidence_type ?? 'none',
  }

  const { data: objective, error } = await supabase
    .from('objectives')
    .insert(objectiveData)
    .select()
    .single()

  if (error) {
    throw error
  }

  return objective
}

/**
 * Hook to create an objective
 */
export function useCreateObjective() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createObjective,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['objectives', data.quest_id] })
    },
  })
}

/**
 * Update an objective
 */
async function updateObjective({
  id,
  data,
}: {
  id: string
  data: Partial<ObjectiveFormData>
}): Promise<ObjectiveRow> {
  const supabase = createClient()

  const updateData: ObjectiveUpdate = {}

  if (data.title !== undefined) updateData.title = data.title
  if (data.description !== undefined) updateData.description = data.description
  if (data.points !== undefined) updateData.points = data.points
  if (data.display_order !== undefined) updateData.display_order = data.display_order
  if (data.depends_on_id !== undefined) updateData.depends_on_id = data.depends_on_id
  if (data.evidence_required !== undefined) updateData.evidence_required = data.evidence_required
  if (data.evidence_type !== undefined) updateData.evidence_type = data.evidence_type

  const { data: objective, error } = await supabase
    .from('objectives')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw error
  }

  return objective
}

/**
 * Hook to update an objective
 */
export function useUpdateObjective() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateObjective,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['objectives', data.quest_id] })
    },
  })
}

/**
 * Delete an objective
 */
async function deleteObjective(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('objectives')
    .delete()
    .eq('id', id)

  if (error) {
    throw error
  }
}

/**
 * Hook to delete an objective
 */
export function useDeleteObjective() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteObjective,
    onSuccess: () => {
      // Invalidate all objectives queries since we don't know the quest_id
      queryClient.invalidateQueries({ queryKey: ['objectives'] })
    },
  })
}

/**
 * Reorder objectives
 */
async function reorderObjectives(
  updates: Array<{ id: string; display_order: number }>
): Promise<void> {
  const supabase = createClient()

  // Update each objective's display_order
  const promises = updates.map(({ id, display_order }) =>
    supabase
      .from('objectives')
      .update({ display_order })
      .eq('id', id)
  )

  const results = await Promise.all(promises)

  // Check for any errors
  const errors = results.filter((r) => r.error)
  if (errors.length > 0) {
    throw new Error('Failed to reorder objectives')
  }
}

/**
 * Hook to reorder objectives
 */
export function useReorderObjectives() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: reorderObjectives,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objectives'] })
    },
  })
}
