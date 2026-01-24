import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useQuests } from '@/lib/hooks/use-quests'
import { createWrapper } from '@/tests/utils/test-utils'
import type { Quest } from '@/lib/types/quest'

// Mock data for database response (raw format)
const mockDbQuests = [
  {
    id: 'quest-1',
    guild_id: 'guild-1',
    title: 'Defeat the Dragon',
    description: 'A fearsome dragon terrorizes the village',
    status: 'open',
    xp_reward: 500,
    created_by: 'gm-1',
    claimed_by: null,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'quest-2',
    guild_id: 'guild-1',
    title: 'Gather Herbs',
    description: 'Collect 10 moonflowers',
    status: 'open',
    xp_reward: 150,
    created_by: 'gm-1',
    claimed_by: null,
    created_at: '2024-01-02T00:00:00.000Z',
    updated_at: '2024-01-02T00:00:00.000Z',
  },
]

// Create a chainable mock builder
function createMockQueryBuilder(data: unknown[] = []) {
  const builder = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({ data, error: null }),
  }
  return builder
}

const mockFrom = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    from: mockFrom,
  })),
}))

describe('useQuests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Setup default mock
    const queryBuilder = createMockQueryBuilder(mockDbQuests)
    mockFrom.mockReturnValue(queryBuilder)
  })

  it('should fetch quests successfully', async () => {
    const { result } = renderHook(() => useQuests(), {
      wrapper: createWrapper(),
    })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toHaveLength(2)
    expect(result.current.data?.[0].title).toBe('Defeat the Dragon')
    expect(result.current.data?.[1].title).toBe('Gather Herbs')
    expect(result.current.error).toBeNull()
  })

  it('should filter quests by category', async () => {
    const combatQuest = mockDbQuests[0]
    const queryBuilder = createMockQueryBuilder([combatQuest])
    mockFrom.mockReturnValue(queryBuilder)

    const { result } = renderHook(
      () => useQuests({ category_id: 'cat-combat' }),
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toHaveLength(1)
    expect(result.current.data?.[0].title).toBe('Defeat the Dragon')
  })

  it('should handle error state', async () => {
    const error = new Error('Failed to fetch quests')
    const queryBuilder = createMockQueryBuilder([])
    queryBuilder.order = vi.fn().mockResolvedValue({ data: null, error })
    mockFrom.mockReturnValue(queryBuilder)

    const { result } = renderHook(() => useQuests(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBeTruthy()
  })

  it('should return empty array when no quests found', async () => {
    const queryBuilder = createMockQueryBuilder([])
    mockFrom.mockReturnValue(queryBuilder)

    const { result } = renderHook(() => useQuests(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toEqual([])
  })

  it('should call supabase with correct table', async () => {
    const { result } = renderHook(() => useQuests(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(mockFrom).toHaveBeenCalledWith('quests')
  })

  it('should return quests with open status', async () => {
    const { result } = renderHook(() => useQuests(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Quests should have 'open' status
    expect(result.current.data?.[0].status).toBe('open')
  })
})
