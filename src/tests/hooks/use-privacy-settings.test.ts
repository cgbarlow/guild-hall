import { describe, it, expect } from 'vitest'

describe('usePrivacySettings hook interface', () => {
  it('exports usePrivacySettings function', async () => {
    const privacyModule = await import('@/lib/hooks/use-privacy-settings')
    expect(typeof privacyModule.usePrivacySettings).toBe('function')
  })

  it('exports useUpdatePrivacySettings function', async () => {
    const privacyModule = await import('@/lib/hooks/use-privacy-settings')
    expect(typeof privacyModule.useUpdatePrivacySettings).toBe('function')
  })
})

describe('privacy schema', () => {
  it('exports privacySettingsSchema', async () => {
    const schemaModule = await import('@/lib/schemas/privacy.schema')
    expect(schemaModule.privacySettingsSchema).toBeDefined()
  })

  it('validates correct privacy settings', async () => {
    const { privacySettingsSchema } = await import('@/lib/schemas/privacy.schema')
    const result = privacySettingsSchema.safeParse({
      show_profile: true,
      show_stats: false,
      show_activity: true,
      allow_guild_invites: false,
    })
    expect(result.success).toBe(true)
  })

  it('applies default values', async () => {
    const { privacySettingsSchema } = await import('@/lib/schemas/privacy.schema')
    const result = privacySettingsSchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.show_profile).toBe(true)
      expect(result.data.show_stats).toBe(true)
      expect(result.data.show_activity).toBe(true)
      expect(result.data.allow_guild_invites).toBe(true)
    }
  })
})
