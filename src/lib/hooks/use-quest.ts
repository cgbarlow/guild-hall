'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Objective, QuestWithRelations, QuestStatus } from '@/lib/types/quest'

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

  // Objectives table doesn't exist in current schema
  // When it's added, this can be updated to fetch objectives
  const objectives: Objective[] = []

  // Transform to our Quest type
  const quest: QuestWithRelations = {
    id: questData.id,
    guild_id: questData.guild_id,
    title: questData.title,
    description: questData.description,
    short_description: questData.description?.substring(0, 100) || null,
    status: questData.status as QuestStatus,
    points: questData.xp_reward,
    xp_reward: questData.xp_reward,
    time_limit_days: null,
    deadline: null,
    category_id: null,
    category: null,
    created_by: questData.created_by,
    claimed_by: questData.claimed_by,
    created_at: questData.created_at,
    updated_at: questData.updated_at,
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
