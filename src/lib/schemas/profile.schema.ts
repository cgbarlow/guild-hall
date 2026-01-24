import { z } from 'zod'

export const profileSchema = z.object({
  display_name: z.string().min(2).max(50).nullable().optional(),
  bio: z.string().max(500).nullable().optional(),
  avatar_url: z.string().url().nullable().optional(),
})

export const updateProfileSchema = profileSchema.partial()
export type ProfileFormData = z.infer<typeof profileSchema>
export type UpdateProfileData = z.infer<typeof updateProfileSchema>
