'use server'

import { createClient } from '@/lib/supabase/server'

export type QuestActionResult = {
  success: boolean
  error?: string
  data?: {
    userQuestId: string
    questId: string
  }
}

/**
 * Accept a quest by creating a user_quests entry
 * This server action handles the database transaction
 */
export async function acceptQuestAction(questId: string): Promise<QuestActionResult> {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Check if quest exists and is available (published status)
  // Type for query result (Supabase type inference doesn't work properly)
  type QuestResult = { id: string; status: string }

  const { data: rawQuest, error: questError } = await supabase
    .from('quests')
    .select('id, status')
    .eq('id', questId)
    .single()

  if (questError || !rawQuest) {
    return { success: false, error: 'Quest not found' }
  }

  const quest = rawQuest as unknown as QuestResult

  if (quest.status !== 'published') {
    return { success: false, error: 'Quest is not available' }
  }

  // Check if user has already accepted this quest
  const { data: existingUserQuest } = await supabase
    .from('user_quests')
    .select('id')
    .eq('user_id', user.id)
    .eq('quest_id', questId)
    .single()

  if (existingUserQuest) {
    return { success: false, error: 'You have already accepted this quest' }
  }

  // Insert into user_quests with 'accepted' status
  // Type assertion to bypass Supabase type inference issues
  const { data: userQuest, error: insertError } = await (supabase
    .from('user_quests') as ReturnType<typeof supabase.from>)
    .insert({
      user_id: user.id,
      quest_id: questId,
      status: 'accepted',
      accepted_at: new Date().toISOString(),
    } as Record<string, unknown>)
    .select('id')
    .single()

  if (insertError || !userQuest) {
    return { success: false, error: insertError?.message || 'Failed to accept quest' }
  }

  return {
    success: true,
    data: {
      userQuestId: (userQuest as unknown as { id: string }).id,
      questId,
    },
  }
}
