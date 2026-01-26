'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type BadgeUploadResult = {
  success: boolean
  url?: string
  error?: string
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

/**
 * Upload a quest badge to Supabase Storage
 */
export async function uploadQuestBadge(questId: string, formData: FormData): Promise<BadgeUploadResult> {
  const supabase = await createClient()

  // Get current user and verify GM role
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Verify user is a GM
  const { data: isGm } = await supabase.rpc('is_gm')
  if (!isGm) {
    return { success: false, error: 'Not authorized' }
  }

  const file = formData.get('file') as File | null
  if (!file) {
    return { success: false, error: 'No file provided' }
  }

  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { success: false, error: 'Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.' }
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return { success: false, error: 'File too large. Maximum size is 5MB.' }
  }

  // Generate unique filename
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'png'
  const fileName = `badges/${questId}/badge-${Date.now()}.${fileExt}`

  // Delete old badge if exists
  const { data: existingFiles } = await supabase.storage
    .from('avatars')
    .list(`badges/${questId}`)

  if (existingFiles && existingFiles.length > 0) {
    const filesToDelete = existingFiles.map(f => `badges/${questId}/${f.name}`)
    await supabase.storage.from('avatars').remove(filesToDelete)
  }

  // Upload new badge
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
    })

  if (uploadError) {
    console.error('Badge upload error:', uploadError)
    return { success: false, error: uploadError.message }
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName)

  // Update quest with new badge URL
  const { error: updateError } = await (supabase
    .from('quests') as ReturnType<typeof supabase.from>)
    .update({ badge_url: publicUrl, updated_at: new Date().toISOString() } as Record<string, unknown>)
    .eq('id', questId)

  if (updateError) {
    console.error('Quest update error:', updateError)
    return { success: false, error: 'Failed to update quest with new badge' }
  }

  revalidatePath('/gm/quests')
  revalidatePath(`/gm/quests/${questId}`)
  revalidatePath('/quests')
  revalidatePath('/dashboard')
  revalidatePath('/my-quests')

  return { success: true, url: publicUrl }
}

/**
 * Remove a quest's badge
 */
export async function removeQuestBadge(questId: string): Promise<BadgeUploadResult> {
  const supabase = await createClient()

  // Get current user and verify GM role
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Verify user is a GM
  const { data: isGm } = await supabase.rpc('is_gm')
  if (!isGm) {
    return { success: false, error: 'Not authorized' }
  }

  // Delete badge files
  const { data: existingFiles } = await supabase.storage
    .from('avatars')
    .list(`badges/${questId}`)

  if (existingFiles && existingFiles.length > 0) {
    const filesToDelete = existingFiles.map(f => `badges/${questId}/${f.name}`)
    await supabase.storage.from('avatars').remove(filesToDelete)
  }

  // Clear badge URL in quest
  const { error: updateError } = await (supabase
    .from('quests') as ReturnType<typeof supabase.from>)
    .update({ badge_url: null, updated_at: new Date().toISOString() } as Record<string, unknown>)
    .eq('id', questId)

  if (updateError) {
    console.error('Quest update error:', updateError)
    return { success: false, error: 'Failed to update quest' }
  }

  revalidatePath('/gm/quests')
  revalidatePath(`/gm/quests/${questId}`)
  revalidatePath('/quests')
  revalidatePath('/dashboard')
  revalidatePath('/my-quests')

  return { success: true }
}
