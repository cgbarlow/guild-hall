'use server'

import { createServiceClient } from '@/lib/supabase/server'
import type { Quest, QuestWithRelations, Objective, Category, QuestStatus, QuestDifficulty, QuestResource } from '@/lib/types/quest'

/**
 * Fetch all published quests (server action using service role)
 */
export async function getPublishedQuests(filters?: {
  category_id?: string
  search?: string
  featured?: boolean
}): Promise<Quest[]> {
  const supabase = createServiceClient()

  let query = supabase
    .from('quests')
    .select('*, categories(id, name, description, icon)')
    .eq('status', 'published')
    .eq('is_template', false)

  if (filters?.category_id) {
    query = query.eq('category_id', filters.category_id)
  }

  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }

  if (filters?.featured !== undefined) {
    query = query.eq('featured', filters.featured)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching quests:', error)
    return []
  }

  return (data || []).map((quest: Record<string, unknown>) => ({
    id: quest.id as string,
    title: quest.title as string,
    description: quest.description as string | null,
    short_description: (quest.description as string)?.substring(0, 100) || null,
    status: quest.status as QuestStatus,
    points: quest.points as number,
    xp_reward: quest.points as number,
    time_limit_days: quest.completion_days as number | null,
    completion_days: quest.completion_days as number | null,
    deadline: null,
    acceptance_deadline: quest.acceptance_deadline as string | null,
    category_id: quest.category_id as string | null,
    category: quest.categories as Category | null,
    is_template: quest.is_template as boolean,
    template_id: quest.template_id as string | null,
    narrative_context: quest.narrative_context as string | null,
    transformation_goal: quest.transformation_goal as string | null,
    reward_description: quest.reward_description as string | null,
    difficulty: (quest.difficulty as QuestDifficulty) ?? 'Apprentice',
    resources: (quest.resources as QuestResource[]) ?? [],
    design_notes: quest.design_notes as string | null,
    featured: (quest.featured as boolean) ?? false,
    created_by: quest.created_by as string,
    created_at: quest.created_at as string,
    updated_at: quest.updated_at as string,
    published_at: quest.published_at as string | null,
    archived_at: quest.archived_at as string | null,
  }))
}

/**
 * Fetch a single quest by ID with objectives (server action using service role)
 */
export async function getQuestById(questId: string): Promise<QuestWithRelations | null> {
  const supabase = createServiceClient()

  const { data: rawQuest, error: questError } = await supabase
    .from('quests')
    .select('*, categories(id, name, description, icon)')
    .eq('id', questId)
    .single()

  if (questError || !rawQuest) {
    console.error('Error fetching quest:', questError)
    return null
  }

  const quest = rawQuest as Record<string, unknown>

  // Fetch objectives
  const { data: objectives } = await supabase
    .from('objectives')
    .select('*')
    .eq('quest_id', questId)
    .order('display_order', { ascending: true })

  const mappedObjectives: Objective[] = (objectives || []).map((obj: Record<string, unknown>) => ({
    id: obj.id as string,
    quest_id: obj.quest_id as string,
    title: obj.title as string,
    description: obj.description as string | null,
    points: obj.points as number,
    display_order: obj.display_order as number,
    depends_on_id: obj.depends_on_id as string | null,
    evidence_required: obj.evidence_required as boolean,
    evidence_type: obj.evidence_type as 'none' | 'text' | 'link' | 'text_or_link',
    resource_url: (obj.resource_url as string | null) ?? null,
    created_at: obj.created_at as string,
    updated_at: obj.updated_at as string,
  }))

  return {
    id: quest.id as string,
    title: quest.title as string,
    description: quest.description as string | null,
    short_description: (quest.description as string)?.substring(0, 100) || null,
    status: quest.status as QuestStatus,
    points: quest.points as number,
    xp_reward: quest.points as number,
    time_limit_days: quest.completion_days as number | null,
    completion_days: quest.completion_days as number | null,
    deadline: null,
    acceptance_deadline: quest.acceptance_deadline as string | null,
    category_id: quest.category_id as string | null,
    category: quest.categories as Category | null,
    is_template: quest.is_template as boolean,
    template_id: quest.template_id as string | null,
    narrative_context: quest.narrative_context as string | null,
    transformation_goal: quest.transformation_goal as string | null,
    reward_description: quest.reward_description as string | null,
    difficulty: (quest.difficulty as QuestDifficulty) ?? 'Apprentice',
    resources: (quest.resources as QuestResource[]) ?? [],
    design_notes: quest.design_notes as string | null,
    featured: (quest.featured as boolean) ?? false,
    created_by: quest.created_by as string,
    created_at: quest.created_at as string,
    updated_at: quest.updated_at as string,
    published_at: quest.published_at as string | null,
    archived_at: quest.archived_at as string | null,
    objectives: mappedObjectives,
  }
}

/**
 * Fetch all quests for GM (includes drafts and archived)
 */
export async function getGMQuests(): Promise<Quest[]> {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('quests')
    .select('*, categories(id, name, description, icon)')
    .eq('is_template', false)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching GM quests:', error)
    return []
  }

  return (data || []).map((quest: Record<string, unknown>) => ({
    id: quest.id as string,
    title: quest.title as string,
    description: quest.description as string | null,
    short_description: (quest.description as string)?.substring(0, 100) || null,
    status: quest.status as QuestStatus,
    points: quest.points as number,
    xp_reward: quest.points as number,
    time_limit_days: quest.completion_days as number | null,
    completion_days: quest.completion_days as number | null,
    deadline: null,
    acceptance_deadline: quest.acceptance_deadline as string | null,
    category_id: quest.category_id as string | null,
    category: quest.categories as Category | null,
    is_template: quest.is_template as boolean,
    template_id: quest.template_id as string | null,
    narrative_context: quest.narrative_context as string | null,
    transformation_goal: quest.transformation_goal as string | null,
    reward_description: quest.reward_description as string | null,
    difficulty: (quest.difficulty as QuestDifficulty) ?? 'Apprentice',
    resources: (quest.resources as QuestResource[]) ?? [],
    design_notes: quest.design_notes as string | null,
    featured: (quest.featured as boolean) ?? false,
    created_by: quest.created_by as string,
    created_at: quest.created_at as string,
    updated_at: quest.updated_at as string,
    published_at: quest.published_at as string | null,
    archived_at: quest.archived_at as string | null,
  }))
}
