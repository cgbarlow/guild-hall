'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Objective, QuestWithRelations, QuestStatus, Category } from '@/lib/types/quest'

/**
 * Fetch a single quest by ID with its objectives
 */
async function fetchQuest(questId: string): Promise<QuestWithRelations | null> {
  const supabase = createClient()

  // Fetch the quest
  const { data: questData, error: questError } = await supabase
    .from('quests')
    .select('*')
    .eq('id', questId)
    .single()

  if (questError) {
    throw questError
  }

  if (!questData) {
    return null
  }

  // Fetch objectives for this quest
  const { data: objectivesData, error: objectivesError } = await supabase
    .from('objectives')
    .select('*')
    .eq('quest_id', questId)
    .order('display_order', { ascending: true })

  if (objectivesError) {
    // Objectives might not exist yet, that's ok
    console.warn('Could not fetch objectives:', objectivesError.message)
  }

  const objectives: Objective[] = (objectivesData || []).map((obj) => ({
    id: obj.id,
    quest_id: obj.quest_id,
    title: obj.title,
    description: obj.description,
    points: obj.points,
    display_order: obj.display_order,
    depends_on_id: obj.depends_on_id,
    evidence_required: obj.evidence_required,
    evidence_type: obj.evidence_type,
    created_at: obj.created_at,
    updated_at: obj.updated_at,
  }))

  // Fetch category if exists
  let category: Category | null = null
  if (questData.category_id) {
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .select('*')
      .eq('id', questData.category_id)
      .single()

    if (!categoryError && categoryData) {
      category = {
        id: categoryData.id,
        name: categoryData.name,
        description: categoryData.description,
        icon: categoryData.icon,
        display_order: categoryData.display_order,
        created_at: categoryData.created_at,
      }
    }
  }

  // Transform to our Quest type
  const quest: QuestWithRelations = {
    id: questData.id,
    title: questData.title,
    description: questData.description,
    short_description: questData.description?.substring(0, 100) || null,
    status: questData.status as QuestStatus,
    points: questData.points,
    xp_reward: questData.points, // Alias for backward compatibility
    time_limit_days: questData.completion_days,
    completion_days: questData.completion_days,
    deadline: null,
    acceptance_deadline: questData.acceptance_deadline,
    category_id: questData.category_id,
    category,
    is_template: questData.is_template,
    template_id: questData.template_id,
    narrative_context: questData.narrative_context,
    transformation_goal: questData.transformation_goal,
    reward_description: questData.reward_description,
    created_by: questData.created_by,
    created_at: questData.created_at,
    updated_at: questData.updated_at,
    published_at: questData.published_at,
    archived_at: questData.archived_at,
    objectives,
  }

  return quest
}

/**
 * React Query hook to fetch a single quest by ID
 */
export function useQuest(questId: string | undefined) {
  return useQuery({
    queryKey: ['quest', questId],
    queryFn: () => fetchQuest(questId!),
    enabled: !!questId,
  })
}
