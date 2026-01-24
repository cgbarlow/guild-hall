'use server'

import { createClient } from '@/lib/supabase/server'
import { evidenceSchema } from '@/lib/schemas/evidence.schema'

export type EvidenceActionResult = {
  success: boolean
  error?: string
}

/**
 * Submit evidence for a user objective
 * This server action handles validation and database update
 */
export async function submitEvidenceAction(
  userObjectiveId: string,
  evidenceText?: string,
  evidenceUrl?: string
): Promise<EvidenceActionResult> {
  // Validate input
  const validation = evidenceSchema.safeParse({
    userObjectiveId,
    evidenceText,
    evidenceUrl,
  })

  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors[0]?.message || 'Invalid evidence data',
    }
  }

  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Verify the user owns this objective
  const { data: userObjective, error: fetchError } = await supabase
    .from('user_objectives')
    .select(`
      id,
      status,
      user_quests!inner (
        user_id
      )
    `)
    .eq('id', userObjectiveId)
    .single()

  if (fetchError || !userObjective) {
    return { success: false, error: 'Objective not found' }
  }

  // Check if user owns this objective
  const userQuests = userObjective.user_quests as { user_id: string }
  if (userQuests.user_id !== user.id) {
    return { success: false, error: 'You do not have permission to submit evidence for this objective' }
  }

  // Check if objective is in a valid state for submission
  if (userObjective.status !== 'available') {
    return {
      success: false,
      error: userObjective.status === 'locked'
        ? 'This objective is locked. Complete the prerequisite objectives first.'
        : 'Evidence has already been submitted for this objective',
    }
  }

  // Update the objective with evidence
  const updateData: {
    status: 'submitted'
    evidence_text?: string | null
    evidence_url?: string | null
    submitted_at: string
  } = {
    status: 'submitted',
    submitted_at: new Date().toISOString(),
  }

  if (evidenceText) {
    updateData.evidence_text = evidenceText
  }

  if (evidenceUrl) {
    updateData.evidence_url = evidenceUrl
  }

  const { error: updateError } = await supabase
    .from('user_objectives')
    .update(updateData)
    .eq('id', userObjectiveId)

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  return { success: true }
}
