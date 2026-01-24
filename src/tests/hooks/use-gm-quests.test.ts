import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useGMQuests } from '@/lib/hooks/use-gm-quests'
import { createWrapper } from '@/tests/utils/test-utils'
import type { QuestDbStatus } from '@/lib/types/quest'

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

// Mock data for database response (raw format matching new schema)
const mockDbQuests = [
  {
    id: 'quest-1',
    title: 'Defeat the Dragon',
    description: 'A fearsome dragon terrorizes the village',
    category_id: 'cat-combat',
    points: 500,
    reward_description: '500 guild points',
    acceptance_deadline: null,
    completion_days: 7,
    status: 'published' as QuestDbStatus,
    is_template: false,
    template_id: null,
    narrative_context: null,
    transformation_goal: null,
    created_by: 'gm-456',
    created_at: '2024-01-15T00:00:00.000Z',
    updated_at: '2024-01-15T00:00:00.000Z',
    published_at: '2024-01-15T00:00:00.000Z',
    archived_at: null,
  },
  {
    id: 'quest-2',
    title: 'Gather Herbs',
    description: 'Collect 10 moonflowers',
    category_id: 'cat-gathering',
    points: 150,
    reward_description: null,
    acceptance_deadline: null,
    completion_days: 3,
    status: 'draft' as QuestDbStatus,
    is_template: false,
    template_id: null,
    narrative_context: null,
    transformation_goal: null,
    created_by: 'gm-456',
    created_at: '2024-01-10T00:00:00.000Z',
    updated_at: '2024-01-12T00:00:00.000Z',
    published_at: null,
    archived_at: null,
  },
  {
    id: 'quest-3',
    title: 'Map the Ancient Ruins',
    description: 'Explore and document the ruins',
    category_id: 'cat-exploration',
    points: 300,
    reward_description: null,
    acceptance_deadline: null,
    completion_days: 14,
    status: 'archived' as QuestDbStatus,
    is_template: false,
    template_id: null,
    narrative_context: null,
    transformation_goal: null,
    created_by: 'gm-456',
    created_at: '2024-01-05T00:00:00.000Z',
    updated_at: '2024-01-14T00:00:00.000Z',
    published_at: '2024-01-06T00:00:00.000Z',
    archived_at: '2024-01-14T00:00:00.000Z',
  },
]

// Create a chainable mock builder
function createMockQueryBuilder(data: unknown[] = []) {
  const builder = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
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

describe('useGMQuests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Setup default mock
    const queryBuilder = createMockQueryBuilder(mockDbQuests)
    mockFrom.mockReturnValue(queryBuilder)
  })

  it('should fetch all quests (GM view)', async () => {
    const { result } = renderHook(() => useGMQuests(), {
      wrapper: createWrapper(),
    })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toHaveLength(3)
    expect(result.current.data?.[0].title).toBe('Defeat the Dragon')
    expect(result.current.data?.[1].title).toBe('Gather Herbs')
    expect(result.current.data?.[2].title).toBe('Map the Ancient Ruins')
    expect(result.current.error).toBeNull()
  })

  it('should fetch quests with all statuses (draft, published, archived)', async () => {
    const { result } = renderHook(() => useGMQuests(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const statuses = result.current.data?.map((q) => q.status)
    expect(statuses).toContain('published')
    expect(statuses).toContain('draft')
    expect(statuses).toContain('archived')
  })

  it('should filter quests by status', async () => {
    const draftQuests = mockDbQuests.filter((q) => q.status === 'draft')
    const queryBuilder = createMockQueryBuilder(draftQuests)
    mockFrom.mockReturnValue(queryBuilder)

    const { result } = renderHook(
      () => useGMQuests({ status: 'draft' }),
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toHaveLength(1)
    expect(result.current.data?.[0].status).toBe('draft')
    expect(result.current.data?.[0].title).toBe('Gather Herbs')
  })

  it('should filter by multiple statuses', async () => {
    const activeQuests = mockDbQuests.filter(
      (q) => q.status === 'draft' || q.status === 'published'
    )
    const queryBuilder = createMockQueryBuilder(activeQuests)
    mockFrom.mockReturnValue(queryBuilder)

    const { result } = renderHook(
      () => useGMQuests({ status: ['draft', 'published'] }),
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toHaveLength(2)
    expect(result.current.data?.some((q) => q.status === 'draft')).toBe(true)
    expect(result.current.data?.some((q) => q.status === 'published')).toBe(true)
  })

  it('should filter by category', async () => {
    const combatQuests = mockDbQuests.filter((q) => q.category_id === 'cat-combat')
    const queryBuilder = createMockQueryBuilder(combatQuests)
    mockFrom.mockReturnValue(queryBuilder)

    const { result } = renderHook(
      () => useGMQuests({ category_id: 'cat-combat' }),
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toHaveLength(1)
    expect(result.current.data?.[0].title).toBe('Defeat the Dragon')
  })

  it('should search quests by title', async () => {
    const dragonQuests = mockDbQuests.filter((q) =>
      q.title.toLowerCase().includes('dragon')
    )
    const queryBuilder = createMockQueryBuilder(dragonQuests)
    mockFrom.mockReturnValue(queryBuilder)

    const { result } = renderHook(
      () => useGMQuests({ search: 'dragon' }),
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toHaveLength(1)
    expect(result.current.data?.[0].title).toBe('Defeat the Dragon')
  })

  it('should exclude templates by default', async () => {
    const queryBuilder = createMockQueryBuilder(mockDbQuests)
    mockFrom.mockReturnValue(queryBuilder)

    renderHook(() => useGMQuests(), {
      wrapper: createWrapper(),
    })

    // Verify eq was called with is_template = false
    await waitFor(() => {
      expect(queryBuilder.eq).toHaveBeenCalledWith('is_template', false)
    })
  })

  it('should include templates when specified', async () => {
    const queryBuilder = createMockQueryBuilder(mockDbQuests)
    mockFrom.mockReturnValue(queryBuilder)

    renderHook(() => useGMQuests({ is_template: true }), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(queryBuilder.eq).toHaveBeenCalledWith('is_template', true)
    })
  })

  it('should handle error state gracefully by returning empty array', async () => {
    const error = new Error('Failed to fetch quests')
    const queryBuilder = createMockQueryBuilder([])
    queryBuilder.order = vi.fn().mockResolvedValue({ data: null, error })
    mockFrom.mockReturnValue(queryBuilder)

    const { result } = renderHook(() => useGMQuests(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Graceful degradation - returns empty array instead of error
    expect(result.current.data).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('should return empty array when no quests found', async () => {
    const queryBuilder = createMockQueryBuilder([])
    mockFrom.mockReturnValue(queryBuilder)

    const { result } = renderHook(() => useGMQuests(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toEqual([])
  })

  it('should call supabase with correct table', async () => {
    const { result } = renderHook(() => useGMQuests(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(mockFrom).toHaveBeenCalledWith('quests')
  })

  it('should order quests by created_at descending', async () => {
    const queryBuilder = createMockQueryBuilder(mockDbQuests)
    mockFrom.mockReturnValue(queryBuilder)

    const { result } = renderHook(() => useGMQuests(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(queryBuilder.order).toHaveBeenCalledWith('created_at', { ascending: false })
  })
})
