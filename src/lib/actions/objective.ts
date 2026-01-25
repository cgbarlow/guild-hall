'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type UncheckObjectiveResult = {
  success: boolean
  error?: string
}

/**
 * Uncheck (reset) a user objective
 *
 * Rules:
 * - Can uncheck: available, submitted, approved, rejected
 * - Cannot uncheck: locked (need to complete prerequisites first)
 * - Dependents stay unlocked after prerequisite unchecked
 * - No point implications (points are quest-level)
 */
export async function uncheckObjective(userObjectiveId: string): Promise<UncheckObjectiveResult> {
  const supabase = await createClient()

  // Verify user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Fetch the objective to verify ownership and status
  type UserObjectiveResult = {
    id: string
    status: string
    user_quest_id: string
    user_quests: { user_id: string; status: string }
  }

  const { data: rawData, error: fetchError } = await supabase
    .from('user_objectives')
    .select(`
      id,
      status,
      user_quest_id,
      user_quests!inner (
        user_id,
        status
      )
    `)
    .eq('id', userObjectiveId)
    .single()

  if (fetchError || !rawData) {
    return { success: false, error: 'Objective not found' }
  }

  const userObjective = rawData as unknown as UserObjectiveResult

  // Check if user owns this objective
  if (userObjective.user_quests.user_id !== user.id) {
    return { success: false, error: 'You do not have permission to modify this objective' }
  }

  // Check if quest is still active (not completed, abandoned, or expired)
  const inactiveStatuses = ['completed', 'abandoned', 'expired']
  if (inactiveStatuses.includes(userObjective.user_quests.status)) {
    return { success: false, error: 'Cannot modify objectives for completed or inactive quests' }
  }

  // Check if objective can be unchecked
  if (userObjective.status === 'locked') {
    return { success: false, error: 'Cannot uncheck a locked objective. Complete prerequisites first.' }
  }

  // Reset the objective to available
  const { error: updateError } = await (supabase
    .from('user_objectives') as ReturnType<typeof supabase.from>)
    .update({
      status: 'available',
      evidence_text: null,
      evidence_url: null,
      submitted_at: null,
      reviewed_at: null,
      feedback: null,
      updated_at: new Date().toISOString(),
    } as Record<string, unknown>)
    .eq('id', userObjectiveId)

  if (updateError) {
    console.error('Error unchecking objective:', updateError)
    return { success: false, error: updateError.message }
  }

  // If the quest was ready_to_claim or awaiting_final_approval,
  // reset it to in_progress since now not all objectives are approved
  const questStatusesToReset = ['ready_to_claim', 'awaiting_final_approval']
  if (questStatusesToReset.includes(userObjective.user_quests.status)) {
    await (supabase
      .from('user_quests') as ReturnType<typeof supabase.from>)
      .update({
        status: 'in_progress',
        ready_to_claim_at: null,
        updated_at: new Date().toISOString(),
      } as Record<string, unknown>)
      .eq('id', userObjective.user_quest_id)
  }

  // Revalidate relevant paths
  revalidatePath('/my-quests')
  revalidatePath(`/my-quests/${userObjective.user_quest_id}`)

  return { success: true }
}
