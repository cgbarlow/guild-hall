import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { usePendingSubmissions } from '@/lib/hooks/use-pending-submissions'
import { createWrapper } from '@/tests/utils/test-utils'

// Mock auth context
vi.mock('@/contexts/auth-context', () => ({
  useAuth: () => ({
    user: { id: 'gm-user-123' },
    session: { user: { id: 'gm-user-123' } },
    isLoading: false,
  }),
}))

// Mock useIsGM hook
vi.mock('@/lib/auth/hooks', () => ({
  useIsGM: () => ({
    data: true,
    isLoading: false,
  }),
}))

// Mock data for pending submissions (raw database format with user_quests relation)
const mockPendingSubmissionsDb = [
  {
    id: 'uo-1',
    user_quest_id: 'uq-1',
    objective_id: 'obj-1',
    status: 'submitted',
    evidence_text: 'I completed the task by doing X, Y, Z',
    evidence_url: null,
    submitted_at: '2024-01-15T10:00:00.000Z',
    reviewed_by: null,
    reviewed_at: null,
    feedback: null,
    user_quests: {
      id: 'uq-1',
      user_id: 'user-1',
      quest_id: 'quest-1',
      status: 'in_progress',
      users: {
        id: 'user-1',
        display_name: 'Test User',
        email: 'test@example.com',
        total_points: 500,
      },
      quests: {
        id: 'quest-1',
        title: 'Defeat the Dragon',
        points: 100,
      },
    },
    objectives: {
      id: 'obj-1',
      title: 'Slay the beast',
      description: 'Find and defeat the dragon',
      points: 50,
      evidence_type: 'text',
    },
  },
  {
    id: 'uo-2',
    user_quest_id: 'uq-2',
    objective_id: 'obj-2',
    status: 'submitted',
    evidence_text: null,
    evidence_url: 'https://example.com/proof.png',
    submitted_at: '2024-01-16T14:30:00.000Z',
    reviewed_by: null,
    reviewed_at: null,
    feedback: null,
    user_quests: {
      id: 'uq-2',
      user_id: 'user-2',
      quest_id: 'quest-2',
      status: 'in_progress',
      users: {
        id: 'user-2',
        display_name: 'Another User',
        email: 'another@example.com',
        total_points: 1200,
      },
      quests: {
        id: 'quest-2',
        title: 'Gather Herbs',
        points: 50,
      },
    },
    objectives: {
      id: 'obj-2',
      title: 'Collect moonflowers',
      description: 'Gather 10 moonflowers from the forest',
      points: 25,
      evidence_type: 'link',
    },
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

describe('usePendingSubmissions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    const queryBuilder = createMockQueryBuilder(mockPendingSubmissionsDb)
    mockFrom.mockReturnValue(queryBuilder)
  })

  it('should fetch pending submissions', async () => {
    const { result } = renderHook(() => usePendingSubmissions(), {
      wrapper: createWrapper(),
    })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toHaveLength(2)
    expect(result.current.data?.[0].id).toBe('uo-1')
    expect(result.current.data?.[1].id).toBe('uo-2')
    expect(result.current.error).toBeNull()
  })

  it('should filter by quest when questId is provided', async () => {
    const questFilteredSubmissions = mockPendingSubmissionsDb.filter(
      (s) => s.user_quests.quest_id === 'quest-1'
    )
    const queryBuilder = createMockQueryBuilder(questFilteredSubmissions)
    mockFrom.mockReturnValue(queryBuilder)

    const { result } = renderHook(
      () => usePendingSubmissions({ questId: 'quest-1' }),
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toHaveLength(1)
    expect(result.current.data?.[0].user_quest.quest_id).toBe('quest-1')
  })

  it('should only fetch submissions with status "submitted"', async () => {
    const queryBuilder = createMockQueryBuilder(mockPendingSubmissionsDb)
    mockFrom.mockReturnValue(queryBuilder)

    renderHook(() => usePendingSubmissions(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(queryBuilder.eq).toHaveBeenCalledWith('status', 'submitted')
    })
  })

  it('should handle error state gracefully by returning empty array', async () => {
    const error = new Error('Failed to fetch submissions')
    const queryBuilder = createMockQueryBuilder([])
    queryBuilder.order = vi.fn().mockResolvedValue({ data: null, error })
    mockFrom.mockReturnValue(queryBuilder)

    const { result } = renderHook(() => usePendingSubmissions(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Graceful degradation - returns empty array instead of error
    expect(result.current.data).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('should return empty array when no pending submissions', async () => {
    const queryBuilder = createMockQueryBuilder([])
    mockFrom.mockReturnValue(queryBuilder)

    const { result } = renderHook(() => usePendingSubmissions(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toEqual([])
  })

  it('should order submissions by submitted_at ascending', async () => {
    const queryBuilder = createMockQueryBuilder(mockPendingSubmissionsDb)
    mockFrom.mockReturnValue(queryBuilder)

    const { result } = renderHook(() => usePendingSubmissions(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(queryBuilder.order).toHaveBeenCalledWith('submitted_at', { ascending: true })
  })

  it('should call supabase with correct table', async () => {
    renderHook(() => usePendingSubmissions(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(mockFrom).toHaveBeenCalledWith('user_objectives')
    })
  })
})
