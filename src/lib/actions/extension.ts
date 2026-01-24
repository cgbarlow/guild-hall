'use server'

import { createClient } from '@/lib/supabase/server'

export type ExtensionActionResult = {
  success: boolean
  error?: string
}

/**
 * Request a deadline extension for a user quest
 */
export async function requestExtensionAction(
  userQuestId: string,
  reason: string
): Promise<ExtensionActionResult> {
  // Validate reason
  if (!reason || reason.trim().length < 10) {
    return { success: false, error: 'Please provide a reason with at least 10 characters' }
  }

  if (reason.length > 500) {
    return { success: false, error: 'Reason must be less than 500 characters' }
  }

  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Verify the user owns this quest and it's in a valid state
  const { data: userQuest, error: fetchError } = await supabase
    .from('user_quests')
    .select('id, user_id, status, extension_requested, deadline')
    .eq('id', userQuestId)
    .single()

  if (fetchError || !userQuest) {
    return { success: false, error: 'Quest not found' }
  }

  if (userQuest.user_id !== user.id) {
    return { success: false, error: 'You do not have permission to request an extension for this quest' }
  }

  if (userQuest.extension_requested) {
    return { success: false, error: 'An extension has already been requested for this quest' }
  }

  if (!userQuest.deadline) {
    return { success: false, error: 'This quest does not have a deadline' }
  }

  if (userQuest.status === 'completed' || userQuest.status === 'abandoned') {
    return { success: false, error: 'Cannot request extension for a completed or abandoned quest' }
  }

  // Update the quest with extension request
  const { error: updateError } = await supabase
    .from('user_quests')
    .update({
      extension_requested: true,
      extension_requested_at: new Date().toISOString(),
      extension_reason: reason.trim(),
    })
    .eq('id', userQuestId)

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  return { success: true }
}
