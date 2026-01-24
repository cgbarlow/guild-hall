import { z } from 'zod'

export const privacySettingsSchema = z.object({
  show_profile: z.boolean().default(true),
  show_stats: z.boolean().default(true),
  show_activity: z.boolean().default(true),
  allow_guild_invites: z.boolean().default(true),
})

export type PrivacySettingsFormData = z.infer<typeof privacySettingsSchema>
