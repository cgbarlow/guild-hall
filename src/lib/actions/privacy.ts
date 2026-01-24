'use server'

import { createClient } from '@/lib/supabase/server'
import { privacySettingsSchema } from '@/lib/schemas/privacy.schema'

export type PrivacyActionResult = {
  success: boolean
  error?: string
}

export async function updatePrivacySettings(formData: FormData): Promise<PrivacyActionResult> {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { success: false, error: 'Not authenticated' }

  const rawData = {
    show_profile: formData.get('show_profile') === 'true',
    show_stats: formData.get('show_stats') === 'true',
    show_activity: formData.get('show_activity') === 'true',
    allow_guild_invites: formData.get('allow_guild_invites') === 'true',
  }

  const parsed = privacySettingsSchema.safeParse(rawData)
  if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message || 'Invalid data' }

  // Type assertion to bypass Supabase type inference issues
  const { error } = await (supabase
    .from('privacy_settings') as ReturnType<typeof supabase.from>)
    .update({ ...parsed.data, updated_at: new Date().toISOString() } as Record<string, unknown>)
    .eq('user_id', user.id)

  if (error) return { success: false, error: error.message }
  return { success: true }
}
