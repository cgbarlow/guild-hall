'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type ExtensionActionResult = {
  success: boolean
  error?: string
  data?: {
    userQuestId: string
    granted: boolean
    newDeadline?: string
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
    return { error: 'You do not have permission to manage extensions' }
  }

  return { userId: user.id }
}

/**
 * Approve an extension request
 * This server action verifies GM role and updates the user_quest with new deadline
 */
export async function approveExtensionAction(
  userQuestId: string,
  newDeadline: string
): Promise<ExtensionActionResult> {
  const supabase = await createClient()

  // Validate new deadline
  const deadlineDate = new Date(newDeadline)
  if (isNaN(deadlineDate.getTime())) {
    return { success: false, error: 'Invalid deadline date' }
  }

  if (deadlineDate <= new Date()) {
    return { success: false, error: 'New deadline must be in the future' }
  }

  // Verify GM role
  const roleCheck = await verifyGMRole(supabase)
  if ('error' in roleCheck) {
    return { success: false, error: roleCheck.error }
  }

  // Update the extension request (type assertion to bypass Supabase type inference issues)
  const { error } = await (supabase
    .from('user_quests') as ReturnType<typeof supabase.from>)
    .update({
      extension_granted: true,
      extension_decided_by: roleCheck.userId,
      extension_decided_at: new Date().toISOString(),
      extended_deadline: deadlineDate.toISOString(),
      deadline: deadlineDate.toISOString(), // Update the actual deadline
    } as Record<string, unknown>)
    .eq('id', userQuestId)
    .eq('extension_requested', true)

  if (error) {
    return { success: false, error: error.message }
  }

  // Revalidate the extensions page
  revalidatePath('/gm/extensions')

  return {
    success: true,
    data: {
      userQuestId,
      granted: true,
      newDeadline: deadlineDate.toISOString(),
    },
  }
}

/**
 * Deny an extension request
 * This server action verifies GM role and updates the extension_granted to false
 */
export async function denyExtensionAction(
  userQuestId: string
): Promise<ExtensionActionResult> {
  const supabase = await createClient()

  // Verify GM role
  const roleCheck = await verifyGMRole(supabase)
  if ('error' in roleCheck) {
    return { success: false, error: roleCheck.error }
  }

  // Update the extension request (type assertion to bypass Supabase type inference issues)
  const { error } = await (supabase
    .from('user_quests') as ReturnType<typeof supabase.from>)
    .update({
      extension_granted: false,
      extension_decided_by: roleCheck.userId,
      extension_decided_at: new Date().toISOString(),
    } as Record<string, unknown>)
    .eq('id', userQuestId)
    .eq('extension_requested', true)

  if (error) {
    return { success: false, error: error.message }
  }

  // Revalidate the extensions page
  revalidatePath('/gm/extensions')

  return {
    success: true,
    data: {
      userQuestId,
      granted: false,
    },
  }
}
