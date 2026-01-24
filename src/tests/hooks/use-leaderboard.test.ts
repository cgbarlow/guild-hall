import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useLeaderboard, useUserRank, useTopUsers } from '@/lib/hooks/use-leaderboard'
import { createWrapper } from '@/tests/utils/test-utils'

// Mock leaderboard data
const mockLeaderboardData = [
  {
    id: 'user-1',
    display_name: 'Top Player',
    avatar_url: 'https://example.com/avatar1.jpg',
    points: 5000,
    quests_completed: 50,
    rank: 1,
  },
  {
    id: 'user-2',
    display_name: 'Second Place',
    avatar_url: 'https://example.com/avatar2.jpg',
    points: 4500,
    quests_completed: 45,
    rank: 2,
  },
  {
    id: 'user-3',
    display_name: 'Third Place',
    avatar_url: null,
    points: 4000,
    quests_completed: 40,
    rank: 3,
  },
]

// Create a chainable mock builder
function createMockQueryBuilder(data: unknown[] = []) {
  const builder = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: data[0] ?? null, error: null }),
    then: (resolve: (value: { data: unknown[]; error: null }) => void) => {
      return Promise.resolve({ data, error: null }).then(resolve)
    },
  }
  return builder
}

const mockFrom = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    from: mockFrom,
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      }),
    },
  })),
}))

describe('useLeaderboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    const queryBuilder = createMockQueryBuilder(mockLeaderboardData)
    mockFrom.mockReturnValue(queryBuilder)
  })

  it('should fetch leaderboard data successfully', async () => {
    const { result } = renderHook(() => useLeaderboard(), {
      wrapper: createWrapper(),
    })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toHaveLength(3)
    expect(result.current.data?.[0].display_name).toBe('Top Player')
    expect(result.current.data?.[0].rank).toBe(1)
    expect(result.current.data?.[1].rank).toBe(2)
    expect(result.current.error).toBeNull()
  })

  it('should fetch leaderboard with limit', async () => {
    const limitedData = mockLeaderboardData.slice(0, 2)
    const queryBuilder = createMockQueryBuilder(limitedData)
    mockFrom.mockReturnValue(queryBuilder)

    const { result } = renderHook(() => useLeaderboard(2), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toHaveLength(2)
  })

  it('should handle error state', async () => {
    const error = new Error('Failed to fetch leaderboard')
    const queryBuilder = createMockQueryBuilder([])
    queryBuilder.then = () => Promise.reject(error)
    mockFrom.mockReturnValue(queryBuilder)

    const { result } = renderHook(() => useLeaderboard(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBeTruthy()
  })

  it('should return empty array when no data', async () => {
    const queryBuilder = createMockQueryBuilder([])
    mockFrom.mockReturnValue(queryBuilder)

    const { result } = renderHook(() => useLeaderboard(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toEqual([])
  })

  it('should call supabase with correct table', async () => {
    const { result } = renderHook(() => useLeaderboard(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(mockFrom).toHaveBeenCalledWith('leaderboard')
  })
})

describe('useTopUsers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    const queryBuilder = createMockQueryBuilder(mockLeaderboardData.slice(0, 3))
    mockFrom.mockReturnValue(queryBuilder)
  })

  it('should fetch top users with default count', async () => {
    const { result } = renderHook(() => useTopUsers(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toBeDefined()
    expect(mockFrom).toHaveBeenCalledWith('leaderboard')
  })

  it('should fetch top users with custom count', async () => {
    const { result } = renderHook(() => useTopUsers(3), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toBeDefined()
  })
})
