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
  const { data: quest, error: questError } = await supabase
    .from('quests')
    .select('id, status')
    .eq('id', questId)
    .single()

  if (questError || !quest) {
    return { success: false, error: 'Quest not found' }
  }

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
  const { data: userQuest, error: insertError } = await supabase
    .from('user_quests')
    .insert({
      user_id: user.id,
      quest_id: questId,
      status: 'accepted',
      accepted_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (insertError) {
    return { success: false, error: insertError.message }
  }

  return {
    success: true,
    data: {
      userQuestId: userQuest.id,
      questId,
    },
  }
}
