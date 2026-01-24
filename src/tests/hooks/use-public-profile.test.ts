import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { usePublicProfile, publicProfileQueryKey } from '@/lib/hooks/use-public-profile'
import { createWrapper } from '@/tests/utils/test-utils'
import type { PrivacySettings } from '@/lib/types/public-profile'

// Mock the Supabase client
const mockSingle = vi.fn()
const mockOrder = vi.fn()
const mockLimit = vi.fn()
const mockRpc = vi.fn()

const createMockQueryBuilder = () => {
  const builder = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn(() => ({
      limit: mockLimit,
    })),
    single: mockSingle,
  }
  return builder
}

let mockQueryBuilder = createMockQueryBuilder()

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: vi.fn(() => mockQueryBuilder),
    rpc: mockRpc,
  }),
}))

describe('usePublicProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockQueryBuilder = createMockQueryBuilder()
    mockLimit.mockResolvedValue({ data: [], error: null })
    mockRpc.mockResolvedValue({ data: null, error: null })
  })

  describe('Query Key', () => {
    it('should generate correct query key for user ID', () => {
      const userId = 'test-user-123'
      const queryKey = publicProfileQueryKey(userId)
      expect(queryKey).toEqual(['publicProfile', 'test-user-123'])
    })

    it('should generate different query keys for different users', () => {
      const key1 = publicProfileQueryKey('user-1')
      const key2 = publicProfileQueryKey('user-2')
      expect(key1).not.toEqual(key2)
    })
  })

  describe('Fetching public profile', () => {
    it('should fetch public profile by user ID when profile is visible', async () => {
      const mockPrivacySettings: PrivacySettings = {
        profile_visibility: true,
        show_achievements: true,
        show_on_leaderboard: true,
      }

      const mockUserData = {
        id: 'user-123',
        display_name: 'Test User',
        avatar_url: 'https://example.com/avatar.jpg',
        bio: 'A test bio',
        total_points: 1500,
        quests_completed: 10,
        privacy_settings: mockPrivacySettings,
      }

      const mockAchievementsData = [
        {
          id: 'ua-1',
          earned_at: '2024-01-15T00:00:00.000Z',
          achievements: {
            id: 'ach-1',
            name: 'First Quest',
            description: 'Complete your first quest',
            icon: 'trophy',
          },
        },
      ]

      // Mock user profile fetch
      mockSingle.mockResolvedValueOnce({ data: mockUserData, error: null })

      // Mock achievements fetch
      mockLimit.mockResolvedValueOnce({ data: mockAchievementsData, error: null })

      // Mock leaderboard position RPC
      mockRpc.mockResolvedValueOnce({ data: { position: 5 }, error: null })

      const { result } = renderHook(
        () => usePublicProfile('user-123'),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toBeDefined()
      expect(result.current.data?.status).toBe('success')

      if (result.current.data?.status === 'success') {
        expect(result.current.data.data.id).toBe('user-123')
        expect(result.current.data.data.display_name).toBe('Test User')
        expect(result.current.data.data.achievements).toHaveLength(1)
        expect(result.current.data.data.leaderboard_position).toBe(5)
      }
    })

    it('should return private status when profile_visibility is false', async () => {
      const mockPrivacySettings: PrivacySettings = {
        profile_visibility: false,
        show_achievements: true,
        show_on_leaderboard: true,
      }

      const mockUserData = {
        id: 'user-456',
        display_name: 'Private User',
        avatar_url: null,
        bio: null,
        total_points: 500,
        quests_completed: 5,
        privacy_settings: mockPrivacySettings,
      }

      mockSingle.mockResolvedValueOnce({ data: mockUserData, error: null })

      const { result } = renderHook(
        () => usePublicProfile('user-456'),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.status).toBe('private')
    })

    it('should not include achievements when show_achievements is false', async () => {
      const mockPrivacySettings: PrivacySettings = {
        profile_visibility: true,
        show_achievements: false,
        show_on_leaderboard: true,
      }

      const mockUserData = {
        id: 'user-789',
        display_name: 'No Achievements User',
        avatar_url: null,
        bio: 'Bio here',
        total_points: 1000,
        quests_completed: 8,
        privacy_settings: mockPrivacySettings,
      }

      mockSingle.mockResolvedValueOnce({ data: mockUserData, error: null })

      // Mock leaderboard position RPC
      mockRpc.mockResolvedValueOnce({ data: { position: 10 }, error: null })

      const { result } = renderHook(
        () => usePublicProfile('user-789'),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.status).toBe('success')

      if (result.current.data?.status === 'success') {
        expect(result.current.data.data.achievements).toEqual([])
      }
    })

    it('should not include leaderboard position when show_on_leaderboard is false', async () => {
      const mockPrivacySettings: PrivacySettings = {
        profile_visibility: true,
        show_achievements: true,
        show_on_leaderboard: false,
      }

      const mockUserData = {
        id: 'user-leaderboard',
        display_name: 'No Leaderboard User',
        avatar_url: null,
        bio: null,
        total_points: 2000,
        quests_completed: 15,
        privacy_settings: mockPrivacySettings,
      }

      const mockAchievementsData = [
        {
          id: 'ua-2',
          earned_at: '2024-02-01T00:00:00.000Z',
          achievements: {
            id: 'ach-2',
            name: 'Expert',
            description: 'Complete 10 quests',
            icon: 'star',
          },
        },
      ]

      mockSingle.mockResolvedValueOnce({ data: mockUserData, error: null })
      mockLimit.mockResolvedValueOnce({ data: mockAchievementsData, error: null })

      const { result } = renderHook(
        () => usePublicProfile('user-leaderboard'),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.status).toBe('success')

      if (result.current.data?.status === 'success') {
        expect(result.current.data.data.leaderboard_position).toBeUndefined()
        expect(result.current.data.data.achievements).toHaveLength(1)
      }
    })

    it('should return not_found when user does not exist', async () => {
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116', message: 'No rows found' }
      })

      const { result } = renderHook(
        () => usePublicProfile('nonexistent-user'),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.status).toBe('not_found')
    })

    it('should return error status on database error', async () => {
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { code: 'UNKNOWN', message: 'Database connection failed' }
      })

      const { result } = renderHook(
        () => usePublicProfile('error-user'),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.status).toBe('error')
      if (result.current.data?.status === 'error') {
        expect(result.current.data.error).toBe('Database connection failed')
      }
    })

    it('should not fetch when userId is empty', () => {
      const { result } = renderHook(
        () => usePublicProfile(''),
        { wrapper: createWrapper() }
      )

      expect(result.current.fetchStatus).toBe('idle')
    })

    it('should use default display name when display_name is null', async () => {
      const mockPrivacySettings: PrivacySettings = {
        profile_visibility: true,
        show_achievements: false,
        show_on_leaderboard: false,
      }

      const mockUserData = {
        id: 'user-no-name',
        display_name: null,
        avatar_url: null,
        bio: null,
        total_points: 0,
        quests_completed: 0,
        privacy_settings: mockPrivacySettings,
      }

      mockSingle.mockResolvedValueOnce({ data: mockUserData, error: null })

      const { result } = renderHook(
        () => usePublicProfile('user-no-name'),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.status).toBe('success')

      if (result.current.data?.status === 'success') {
        expect(result.current.data.data.display_name).toBe('Anonymous Adventurer')
      }
    })
  })

  describe('Caching behavior', () => {
    it('should cache results and not refetch immediately', async () => {
      const mockPrivacySettings: PrivacySettings = {
        profile_visibility: true,
        show_achievements: false,
        show_on_leaderboard: false,
      }

      const mockUserData = {
        id: 'cached-user',
        display_name: 'Cached User',
        avatar_url: null,
        bio: null,
        total_points: 100,
        quests_completed: 1,
        privacy_settings: mockPrivacySettings,
      }

      mockSingle.mockResolvedValue({ data: mockUserData, error: null })

      const wrapper = createWrapper()

      const { result: result1 } = renderHook(
        () => usePublicProfile('cached-user'),
        { wrapper }
      )

      await waitFor(() => {
        expect(result1.current.isSuccess).toBe(true)
      })

      // First fetch should have been called
      expect(mockSingle).toHaveBeenCalledTimes(1)

      // Render another hook with the same user - should use cache
      const { result: result2 } = renderHook(
        () => usePublicProfile('cached-user'),
        { wrapper }
      )

      // Should immediately have data from cache
      expect(result2.current.data).toBeDefined()

      // Should not have called fetch again
      expect(mockSingle).toHaveBeenCalledTimes(1)
    })
  })
})
