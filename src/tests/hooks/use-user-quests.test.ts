import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useUserQuests } from '@/lib/hooks/use-user-quests'
import { createWrapper } from '@/tests/utils/test-utils'

// Mock data for database response
const mockUserQuests = [
  {
    id: 'uq-1',
    user_id: 'user-123',
    quest_id: 'quest-1',
    status: 'in_progress',
    accepted_at: '2024-01-01T00:00:00.000Z',
    deadline: '2024-02-01T00:00:00.000Z',
    extension_requested: false,
    quests: {
      id: 'quest-1',
      title: 'Defeat the Dragon',
      description: 'A fearsome dragon terrorizes the village.',
      points: 500,
      status: 'published',
    },
  },
  {
    id: 'uq-2',
    user_id: 'user-123',
    quest_id: 'quest-2',
    status: 'completed',
    accepted_at: '2024-01-05T00:00:00.000Z',
    completed_at: '2024-01-10T00:00:00.000Z',
    deadline: null,
    extension_requested: false,
    quests: {
      id: 'quest-2',
      title: 'Gather Herbs',
      description: 'Collect healing herbs from the forest.',
      points: 100,
      status: 'published',
    },
  },
]

// Create a chainable mock builder
function createMockQueryBuilder(data: unknown[]) {
  const builder = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
  }

  // Make the builder thenable
  Object.defineProperty(builder, 'then', {
    value: (resolve: (value: { data: unknown[]; error: null }) => void) => {
      return Promise.resolve({ data, error: null }).then(resolve)
    },
  })

  return builder
}

const mockFrom = vi.fn()
const mockAuth = {
  getUser: vi.fn().mockResolvedValue({
    data: { user: { id: 'user-123' } },
    error: null,
  }),
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    from: mockFrom,
    auth: mockAuth,
  })),
}))

describe('useUserQuests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    })
  })

  it('should fetch user quests successfully', async () => {
    const builder = createMockQueryBuilder(mockUserQuests)
    mockFrom.mockReturnValue(builder)

    const { result } = renderHook(() => useUserQuests(), {
      wrapper: createWrapper(),
    })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toHaveLength(2)
    expect(result.current.data?.[0].quest?.title).toBe('Defeat the Dragon')
    expect(result.current.error).toBeNull()
  })

  it('should filter quests by status', async () => {
    const inProgressQuests = mockUserQuests.filter(q => q.status === 'in_progress')
    const builder = createMockQueryBuilder(inProgressQuests)
    mockFrom.mockReturnValue(builder)

    const { result } = renderHook(() => useUserQuests({ status: 'in_progress' }), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toHaveLength(1)
    expect(result.current.data?.[0].status).toBe('in_progress')
  })

  it('should return undefined when not authenticated', async () => {
    mockAuth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    })

    const { result } = renderHook(() => useUserQuests(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toBeUndefined()
  })

  it('should transform user quest data correctly', async () => {
    const builder = createMockQueryBuilder(mockUserQuests)
    mockFrom.mockReturnValue(builder)

    const { result } = renderHook(() => useUserQuests(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const userQuest = result.current.data?.[0]
    expect(userQuest?.id).toBe('uq-1')
    expect(userQuest?.status).toBe('in_progress')
    expect(userQuest?.quest?.points).toBe(500)
    expect(userQuest?.deadline).toBe('2024-02-01T00:00:00.000Z')
  })
})
