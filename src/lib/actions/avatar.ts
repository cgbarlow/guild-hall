'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type AvatarUploadResult = {
  success: boolean
  url?: string
  error?: string
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

/**
 * Upload a user avatar to Supabase Storage
 */
export async function uploadAvatar(formData: FormData): Promise<AvatarUploadResult> {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: 'Not authenticated' }
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
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`

  // Delete old avatar if exists
  const { data: existingFiles } = await supabase.storage
    .from('avatars')
    .list(user.id)

  if (existingFiles && existingFiles.length > 0) {
    const filesToDelete = existingFiles.map(f => `${user.id}/${f.name}`)
    await supabase.storage.from('avatars').remove(filesToDelete)
  }

  // Upload new avatar
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
    })

  if (uploadError) {
    console.error('Upload error:', uploadError)
    return { success: false, error: uploadError.message }
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName)

  // Update user profile with new avatar URL
  const { error: updateError } = await (supabase
    .from('users') as ReturnType<typeof supabase.from>)
    .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() } as Record<string, unknown>)
    .eq('id', user.id)

  if (updateError) {
    console.error('Profile update error:', updateError)
    return { success: false, error: 'Failed to update profile with new avatar' }
  }

  revalidatePath('/profile')

  return { success: true, url: publicUrl }
}

/**
 * Remove user's avatar
 */
export async function removeAvatar(): Promise<AvatarUploadResult> {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Delete avatar files
  const { data: existingFiles } = await supabase.storage
    .from('avatars')
    .list(user.id)

  if (existingFiles && existingFiles.length > 0) {
    const filesToDelete = existingFiles.map(f => `${user.id}/${f.name}`)
    await supabase.storage.from('avatars').remove(filesToDelete)
  }

  // Clear avatar URL in profile
  const { error: updateError } = await (supabase
    .from('users') as ReturnType<typeof supabase.from>)
    .update({ avatar_url: null, updated_at: new Date().toISOString() } as Record<string, unknown>)
    .eq('id', user.id)

  if (updateError) {
    console.error('Profile update error:', updateError)
    return { success: false, error: 'Failed to update profile' }
  }

  revalidatePath('/profile')

  return { success: true }
}
