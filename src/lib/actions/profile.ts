'use server'

import { createClient } from '@/lib/supabase/server'
import { profileSchema } from '@/lib/schemas/profile.schema'

export type ProfileActionResult = { success: boolean; error?: string }

export async function updateProfile(formData: FormData): Promise<ProfileActionResult> {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Not authenticated' }
  }

  const rawData = {
    display_name: formData.get('display_name') as string | null,
    bio: formData.get('bio') as string | null,
    avatar_url: formData.get('avatar_url') as string | null,
  }

  const parsed = profileSchema.safeParse(rawData)

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message || 'Invalid data' }
  }

  // Type assertion to bypass Supabase type inference issues
  const { error } = await (supabase
    .from('users') as ReturnType<typeof supabase.from>)
    .update({ ...parsed.data, updated_at: new Date().toISOString() } as Record<string, unknown>)
    .eq('id', user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}
