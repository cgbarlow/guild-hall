'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Quest, Objective } from '@/lib/types/quest'
import type { QuestFormData } from '@/lib/schemas/quest.schema'
import type { Database } from '@/lib/types/database'

type QuestRow = Database['public']['Tables']['quests']['Row']
type QuestInsert = Database['public']['Tables']['quests']['Insert']
type ObjectiveRow = Database['public']['Tables']['objectives']['Row']
type ObjectiveInsert = Database['public']['Tables']['objectives']['Insert']

/**
 * Fetch all quest templates
 */
async function fetchTemplates(): Promise<Quest[]> {
  const supabase = createClient()

  const { data: rawData, error } = await supabase
    .from('quests')
    .select('*')
    .eq('is_template', true)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  const data = (rawData || []) as unknown as QuestRow[]

  return data.map((quest) => ({
    id: quest.id,
    title: quest.title,
    description: quest.description,
    short_description: quest.description?.substring(0, 100) || null,
    status: quest.status,
    points: quest.points,
    xp_reward: quest.points,
    time_limit_days: quest.completion_days,
    completion_days: quest.completion_days,
    deadline: null,
    acceptance_deadline: quest.acceptance_deadline,
    category_id: quest.category_id,
    category: null,
    is_template: quest.is_template,
    template_id: quest.template_id,
    narrative_context: quest.narrative_context,
    transformation_goal: quest.transformation_goal,
    reward_description: quest.reward_description,
    difficulty: ((quest as Record<string, unknown>).difficulty as 'Apprentice' | 'Journeyman' | 'Expert' | 'Master') ?? 'Apprentice',
    resources: ((quest as Record<string, unknown>).resources as { title: string; url: string }[]) ?? [],
    design_notes: (quest as Record<string, unknown>).design_notes as string | null ?? null,
    featured: (quest as Record<string, unknown>).featured as boolean ?? false,
    created_by: quest.created_by,
    created_at: quest.created_at,
    updated_at: quest.updated_at,
    published_at: quest.published_at,
    archived_at: quest.archived_at,
  }))
}

/**
 * Hook to fetch all templates
 */
export function useTemplates() {
  return useQuery({
    queryKey: ['templates'],
    queryFn: fetchTemplates,
  })
}

/**
 * Fetch a template with its objectives
 */
async function fetchTemplateWithObjectives(
  templateId: string
): Promise<{ quest: QuestRow; objectives: ObjectiveRow[] }> {
  const supabase = createClient()

  const [questResult, objectivesResult] = await Promise.all([
    supabase.from('quests').select('*').eq('id', templateId).single(),
    supabase
      .from('objectives')
      .select('*')
      .eq('quest_id', templateId)
      .order('display_order', { ascending: true }),
  ])

  if (questResult.error) {
    throw questResult.error
  }

  if (objectivesResult.error) {
    throw objectivesResult.error
  }

  return {
    quest: questResult.data as unknown as QuestRow,
    objectives: (objectivesResult.data || []) as unknown as ObjectiveRow[],
  }
}

/**
 * Clone a template to create a new quest
 */
async function cloneTemplate({
  templateId,
  overrides,
}: {
  templateId: string
  overrides?: Partial<QuestFormData>
}): Promise<QuestRow> {
  const supabase = createClient()

  // Get current user
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) {
    throw new Error('You must be logged in to clone a template')
  }

  // Fetch template with objectives
  const { quest: template, objectives } = await fetchTemplateWithObjectives(templateId)

  // Create the new quest from template
  const newQuestData: QuestInsert = {
    title: overrides?.title ?? `${template.title} (Copy)`,
    description: overrides?.description ?? template.description,
    category_id: overrides?.category_id ?? template.category_id,
    points: overrides?.points ?? template.points,
    reward_description: overrides?.reward_description ?? template.reward_description,
    acceptance_deadline: overrides?.acceptance_deadline ?? null,
    completion_days: overrides?.completion_days ?? template.completion_days,
    narrative_context: overrides?.narrative_context ?? template.narrative_context,
    transformation_goal: overrides?.transformation_goal ?? template.transformation_goal,
    is_template: overrides?.is_template ?? false, // New quest is not a template by default
    template_id: templateId, // Track which template it came from
    created_by: userData.user.id,
    status: 'draft',
  }

  const { data: newQuest, error: questError } = await (supabase
    .from('quests') as ReturnType<typeof supabase.from>)
    .insert(newQuestData as Record<string, unknown>)
    .select()
    .single()

  if (questError) {
    throw questError
  }

  const typedNewQuest = newQuest as unknown as QuestRow

  // Clone objectives if there are any
  if (objectives.length > 0) {
    // Build a map of old objective IDs to new IDs for dependency resolution
    const idMap = new Map<string, string>()

    // First pass: create objectives without dependencies
    for (const obj of objectives) {
      const newObjData: ObjectiveInsert = {
        quest_id: typedNewQuest.id,
        title: obj.title,
        description: obj.description,
        points: obj.points,
        display_order: obj.display_order,
        depends_on_id: null, // Set in second pass
        evidence_required: obj.evidence_required,
        evidence_type: obj.evidence_type,
      }

      const { data: newObj, error: objError } = await (supabase
        .from('objectives') as ReturnType<typeof supabase.from>)
        .insert(newObjData as Record<string, unknown>)
        .select()
        .single()

      if (objError) {
        throw objError
      }

      const typedNewObj = newObj as unknown as ObjectiveRow
      idMap.set(obj.id, typedNewObj.id)
    }

    // Second pass: update dependencies
    for (const obj of objectives) {
      if (obj.depends_on_id) {
        const newId = idMap.get(obj.id)
        const newDependsOnId = idMap.get(obj.depends_on_id)

        if (newId && newDependsOnId) {
          const { error: updateError } = await (supabase
            .from('objectives') as ReturnType<typeof supabase.from>)
            .update({ depends_on_id: newDependsOnId } as Record<string, unknown>)
            .eq('id', newId)

          if (updateError) {
            console.error('Failed to update dependency:', updateError)
          }
        }
      }
    }
  }

  return typedNewQuest
}

/**
 * Hook to clone a template
 */
export function useCloneTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: cloneTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gm-quests'] })
      queryClient.invalidateQueries({ queryKey: ['quests'] })
    },
  })
}

/**
 * Convert an existing quest into a template
 */
async function convertToTemplate(questId: string): Promise<QuestRow> {
  const supabase = createClient()

  const { data: quest, error } = await (supabase
    .from('quests') as ReturnType<typeof supabase.from>)
    .update({ is_template: true } as Record<string, unknown>)
    .eq('id', questId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return quest as unknown as QuestRow
}

/**
 * Hook to convert a quest to a template
 */
export function useConvertToTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: convertToTemplate,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['quest', data.id] })
      queryClient.invalidateQueries({ queryKey: ['gm-quests'] })
      queryClient.invalidateQueries({ queryKey: ['templates'] })
    },
  })
}
