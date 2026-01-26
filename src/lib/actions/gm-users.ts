'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Verify the current user is a GM or admin
 */
async function verifyGMAccess(): Promise<{ userId: string } | { error: string }> {
  const authClient = await createClient()
  const { data: { user: currentUser } } = await authClient.auth.getUser()

  if (!currentUser) {
    return { error: 'Not authenticated' }
  }

  const { data: userRoles } = await authClient
    .from('user_roles')
    .select('role')
    .eq('user_id', currentUser.id)

  const roles = userRoles as { role: string }[] | null
  const isGm = roles?.some(r => r.role === 'gm' || r.role === 'admin')

  if (!isGm) {
    return { error: 'Unauthorized: GM or Admin role required' }
  }

  return { userId: currentUser.id }
}

/**
 * Check if the current user is an admin
 */
async function isAdmin(): Promise<boolean> {
  const authClient = await createClient()
  const { data: { user: currentUser } } = await authClient.auth.getUser()

  if (!currentUser) return false

  const { data: userRoles } = await authClient
    .from('user_roles')
    .select('role')
    .eq('user_id', currentUser.id)

  const roles = userRoles as { role: string }[] | null
  return roles?.some(r => r.role === 'admin') ?? false
}

export interface GMActionResult {
  success: boolean
  message: string
  error?: string
}

/**
 * Delete a user (admin only)
 * This permanently removes the user from both auth.users and public.users
 */
export async function deleteUser(userId: string): Promise<GMActionResult> {
  const authResult = await verifyGMAccess()
  if ('error' in authResult) {
    return { success: false, message: 'Unauthorized', error: authResult.error }
  }

  // Only admins can delete users
  const admin = await isAdmin()
  if (!admin) {
    return { success: false, message: 'Unauthorized', error: 'Only admins can delete users' }
  }

  // Prevent self-deletion
  if (userId === authResult.userId) {
    return { success: false, message: 'Cannot delete yourself', error: 'Self-deletion is not allowed' }
  }

  const supabase = createServiceClient()

  // Check if target user is also an admin
  const { data: targetRoles } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)

  const targetIsAdmin = (targetRoles as { role: string }[] | null)?.some(r => r.role === 'admin')
  if (targetIsAdmin) {
    return { success: false, message: 'Cannot delete admin', error: 'Cannot delete another admin user' }
  }

  try {
    // Delete from auth.users (cascades to public.users due to FK)
    const { error } = await supabase.auth.admin.deleteUser(userId)

    if (error) {
      console.error('[deleteUser] Error:', error)
      return { success: false, message: 'Failed to delete user', error: error.message }
    }

    revalidatePath('/gm/users')
    return { success: true, message: 'User deleted successfully' }
  } catch (err) {
    console.error('[deleteUser] Exception:', err)
    return { success: false, message: 'Failed to delete user', error: String(err) }
  }
}

/**
 * Disable or enable a user's ability to log in
 */
export async function setUserDisabled(userId: string, disabled: boolean): Promise<GMActionResult> {
  const authResult = await verifyGMAccess()
  if ('error' in authResult) {
    return { success: false, message: 'Unauthorized', error: authResult.error }
  }

  // Prevent self-disabling
  if (userId === authResult.userId) {
    return { success: false, message: 'Cannot disable yourself', error: 'Self-disabling is not allowed' }
  }

  const supabase = createServiceClient()

  // Check if target user is an admin
  const { data: targetRoles } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)

  const targetIsAdmin = (targetRoles as { role: string }[] | null)?.some(r => r.role === 'admin')

  // Only admins can disable other admins
  if (targetIsAdmin) {
    const currentIsAdmin = await isAdmin()
    if (!currentIsAdmin) {
      return { success: false, message: 'Cannot disable admin', error: 'Only admins can disable admin users' }
    }
  }

  try {
    // Update the users table (cast to bypass strict typing for new columns)
    const { error: updateError } = await (supabase
      .from('users') as ReturnType<typeof supabase.from>)
      .update({
        is_disabled: disabled,
        disabled_at: disabled ? new Date().toISOString() : null,
        disabled_by: disabled ? authResult.userId : null,
      } as Record<string, unknown>)
      .eq('id', userId)

    if (updateError) {
      console.error('[setUserDisabled] Update error:', updateError)
      return { success: false, message: 'Failed to update user', error: updateError.message }
    }

    // Also update auth.users banned status for immediate effect
    const { error: authError } = await supabase.auth.admin.updateUserById(userId, {
      ban_duration: disabled ? '876000h' : 'none', // ~100 years or unban
    })

    if (authError) {
      console.error('[setUserDisabled] Auth update error:', authError)
      // Rollback the users table update
      await (supabase
        .from('users') as ReturnType<typeof supabase.from>)
        .update({
          is_disabled: !disabled,
          disabled_at: null,
          disabled_by: null,
        } as Record<string, unknown>)
        .eq('id', userId)
      return { success: false, message: 'Failed to update auth status', error: authError.message }
    }

    revalidatePath('/gm/users')
    revalidatePath(`/gm/users/${userId}`)
    return {
      success: true,
      message: disabled ? 'User logins disabled' : 'User logins enabled'
    }
  } catch (err) {
    console.error('[setUserDisabled] Exception:', err)
    return { success: false, message: 'Failed to update user', error: String(err) }
  }
}

/**
 * Force a user to reset their password on next login
 */
export async function forcePasswordReset(userId: string): Promise<GMActionResult> {
  const authResult = await verifyGMAccess()
  if ('error' in authResult) {
    return { success: false, message: 'Unauthorized', error: authResult.error }
  }

  const supabase = createServiceClient()

  try {
    // Get user email for password reset
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single()

    const userEmail = (userData as { email: string } | null)?.email
    if (fetchError || !userEmail) {
      return { success: false, message: 'User not found', error: fetchError?.message || 'No email found' }
    }

    // Set the force_password_reset flag (cast to bypass strict typing)
    const { error: updateError } = await (supabase
      .from('users') as ReturnType<typeof supabase.from>)
      .update({ force_password_reset: true } as Record<string, unknown>)
      .eq('id', userId)

    if (updateError) {
      console.error('[forcePasswordReset] Update error:', updateError)
      return { success: false, message: 'Failed to set password reset flag', error: updateError.message }
    }

    // Send password reset email via Supabase Auth
    // This generates a password reset link that the user can use
    const { error: resetError } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: userEmail,
    })

    if (resetError) {
      console.error('[forcePasswordReset] Reset email error:', resetError)
      // Don't rollback - the flag is still set, they just won't get an email
    }

    revalidatePath('/gm/users')
    revalidatePath(`/gm/users/${userId}`)
    return {
      success: true,
      message: 'Password reset initiated. User must reset password on next login.'
    }
  } catch (err) {
    console.error('[forcePasswordReset] Exception:', err)
    return { success: false, message: 'Failed to initiate password reset', error: String(err) }
  }
}

/**
 * Clear the force password reset flag (called after user resets password)
 */
export async function clearPasswordResetFlag(userId: string): Promise<GMActionResult> {
  const supabase = createServiceClient()

  try {
    const { error } = await (supabase
      .from('users') as ReturnType<typeof supabase.from>)
      .update({ force_password_reset: false } as Record<string, unknown>)
      .eq('id', userId)

    if (error) {
      return { success: false, message: 'Failed to clear flag', error: error.message }
    }

    return { success: true, message: 'Password reset flag cleared' }
  } catch (err) {
    return { success: false, message: 'Failed to clear flag', error: String(err) }
  }
}
