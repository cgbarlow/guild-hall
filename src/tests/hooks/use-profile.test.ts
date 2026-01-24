import { describe, it, expect } from 'vitest'

describe('useProfile hook interface', () => {
  it('exports useProfile function', async () => {
    const module = await import('@/lib/hooks/use-profile')
    expect(typeof module.useProfile).toBe('function')
  })

  it('exports useUpdateProfile function', async () => {
    const module = await import('@/lib/hooks/use-profile')
    expect(typeof module.useUpdateProfile).toBe('function')
  })
})

describe('profile schema', () => {
  it('exports profileSchema', async () => {
    const module = await import('@/lib/schemas/profile.schema')
    expect(module.profileSchema).toBeDefined()
  })

  it('validates correct profile data', async () => {
    const { profileSchema } = await import('@/lib/schemas/profile.schema')
    const result = profileSchema.safeParse({ display_name: 'Test User', bio: 'A test bio', avatar_url: 'https://example.com/avatar.jpg' })
    expect(result.success).toBe(true)
  })

  it('rejects invalid avatar URL', async () => {
    const { profileSchema } = await import('@/lib/schemas/profile.schema')
    const result = profileSchema.safeParse({ display_name: 'Test User', avatar_url: 'not-a-url' })
    expect(result.success).toBe(false)
  })

  it('rejects short display name', async () => {
    const { profileSchema } = await import('@/lib/schemas/profile.schema')
    const result = profileSchema.safeParse({ display_name: 'A' })
    expect(result.success).toBe(false)
  })
})
