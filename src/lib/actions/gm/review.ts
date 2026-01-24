'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type ReviewActionResult = {
  success: boolean
  error?: string
  data?: {
    userObjectiveId: string
    status: 'approved' | 'rejected'
  }
}

/**
 * Verify the current user is a GM
 */
async function verifyGMRole(supabase: Awaited<ReturnType<typeof createClient>>): Promise<{ userId: string } | { error: string }> {
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  // Check if user has GM role
  const { data: userRole, error: roleError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .in('role', ['gm', 'admin'])
    .single()

  if (roleError || !userRole) {
    return { error: 'You do not have permission to review submissions' }
  }

  return { userId: user.id }
}

/**
 * Approve a submission
 * This server action verifies GM role and updates the submission status
 */
export async function approveSubmissionAction(
  userObjectiveId: string,
  feedback?: string
): Promise<ReviewActionResult> {
  const supabase = await createClient()

  // Verify GM role
  const roleCheck = await verifyGMRole(supabase)
  if ('error' in roleCheck) {
    return { success: false, error: roleCheck.error }
  }

  // Update the submission
  const updateData: {
    status: 'approved'
    reviewed_by: string
    reviewed_at: string
    feedback?: string
  } = {
    status: 'approved',
    reviewed_by: roleCheck.userId,
    reviewed_at: new Date().toISOString(),
  }

  if (feedback && feedback.trim()) {
    updateData.feedback = feedback.trim()
  }

  // Type assertion to bypass Supabase type inference issues
  const { error } = await (supabase
    .from('user_objectives') as ReturnType<typeof supabase.from>)
    .update(updateData as Record<string, unknown>)
    .eq('id', userObjectiveId)

  if (error) {
    return { success: false, error: error.message }
  }

  // Revalidate the review pages
  revalidatePath('/gm/review')
  revalidatePath(`/gm/review/${userObjectiveId}`)

  return {
    success: true,
    data: {
      userObjectiveId,
      status: 'approved',
    },
  }
}

/**
 * Reject a submission
 * This server action verifies GM role and updates the submission status
 * Feedback is required for rejections
 */
export async function rejectSubmissionAction(
  userObjectiveId: string,
  feedback: string
): Promise<ReviewActionResult> {
  const supabase = await createClient()

  // Validate feedback
  if (!feedback || feedback.trim().length === 0) {
    return { success: false, error: 'Feedback is required when rejecting a submission' }
  }

  if (feedback.length < 10) {
    return { success: false, error: 'Please provide more detailed feedback (at least 10 characters)' }
  }

  // Verify GM role
  const roleCheck = await verifyGMRole(supabase)
  if ('error' in roleCheck) {
    return { success: false, error: roleCheck.error }
  }

  // Update the submission - reset to available so user can try again
  // Type assertion to bypass Supabase type inference issues
  const { error } = await (supabase
    .from('user_objectives') as ReturnType<typeof supabase.from>)
    .update({
      status: 'available', // Reset to available so user can resubmit
      reviewed_by: roleCheck.userId,
      reviewed_at: new Date().toISOString(),
      feedback: feedback.trim(),
      evidence_text: null, // Clear previous evidence
      evidence_url: null,
      submitted_at: null,
    } as Record<string, unknown>)
    .eq('id', userObjectiveId)

  if (error) {
    return { success: false, error: error.message }
  }

  // Revalidate the review pages
  revalidatePath('/gm/review')
  revalidatePath(`/gm/review/${userObjectiveId}`)

  return {
    success: true,
    data: {
      userObjectiveId,
      status: 'rejected',
    },
  }
}
