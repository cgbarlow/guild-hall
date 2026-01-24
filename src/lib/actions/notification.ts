'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Mark a single notification as read
 */
export async function markNotificationRead(notificationId: string) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  // Type assertion to bypass Supabase type inference issues
  const { error } = await (supabase
    .from('notifications') as ReturnType<typeof supabase.from>)
    .update({
      read: true,
      read_at: new Date().toISOString(),
    } as Record<string, unknown>)
    .eq('id', notificationId)
    .eq('user_id', user.id) // Ensure user can only update their own notifications

  if (error) {
    console.error('Error marking notification as read:', error)
    return { error: error.message }
  }

  revalidatePath('/notifications')
  return { success: true }
}

/**
 * Mark all notifications as read for the current user
 */
export async function markAllNotificationsRead() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  // Type assertion to bypass Supabase type inference issues
  const { error } = await (supabase
    .from('notifications') as ReturnType<typeof supabase.from>)
    .update({
      read: true,
      read_at: new Date().toISOString(),
    } as Record<string, unknown>)
    .eq('user_id', user.id)
    .eq('read', false)

  if (error) {
    console.error('Error marking all notifications as read:', error)
    return { error: error.message }
  }

  revalidatePath('/notifications')
  return { success: true }
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  // Type assertion to bypass Supabase type inference issues
  const { error } = await (supabase
    .from('notifications') as ReturnType<typeof supabase.from>)
    .delete()
    .eq('id', notificationId)
    .eq('user_id', user.id) // Ensure user can only delete their own notifications

  if (error) {
    console.error('Error deleting notification:', error)
    return { error: error.message }
  }

  revalidatePath('/notifications')
  return { success: true }
}

/**
 * Create a notification for a user (internal use, typically called by triggers)
 */
export async function createNotification(data: {
  userId: string
  type: string
  title: string
  message?: string
  referenceType?: string
  referenceId?: string
}) {
  const supabase = await createClient()

  // Type assertion to bypass Supabase type inference issues
  const { error } = await (supabase.from('notifications') as ReturnType<typeof supabase.from>).insert({
    user_id: data.userId,
    type: data.type,
    title: data.title,
    message: data.message,
    reference_type: data.referenceType,
    reference_id: data.referenceId,
  } as Record<string, unknown>)

  if (error) {
    console.error('Error creating notification:', error)
    return { error: error.message }
  }

  return { success: true }
}
