import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import {
  useObjectives,
  useCreateObjective,
  useUpdateObjective,
  useDeleteObjective,
  useReorderObjectives,
} from '@/lib/hooks/use-objectives'
import { createWrapper } from '@/tests/utils/test-utils'
import type { CreateObjectiveData, ObjectiveFormData } from '@/lib/schemas/quest.schema'

// Mock data
const mockObjectives = [
  {
    id: 'obj-1',
    quest_id: 'quest-1',
    title: 'Find the dragon lair',
    description: 'Locate the entrance to the dragon\'s lair',
    points: 100,
    display_order: 0,
    depends_on_id: null,
    evidence_required: true,
    evidence_type: 'text' as const,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'obj-2',
    quest_id: 'quest-1',
    title: 'Defeat the dragon',
    description: 'Slay the dragon in combat',
    points: 300,
    display_order: 1,
    depends_on_id: 'obj-1',
    evidence_required: true,
    evidence_type: 'link' as const,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
  },
]

// Create mock query builder
function createMockQueryBuilder(data: unknown[] = []) {
  const builder = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({ data, error: null }),
    single: vi.fn().mockResolvedValue({ data: data[0], error: null }),
  }
  return builder
}

const mockFrom = vi.fn()
const mockGetUser = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    from: mockFrom,
    auth: {
      getUser: mockGetUser,
    },
  })),
}))

describe('useObjectives', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    const queryBuilder = createMockQueryBuilder(mockObjectives)
    mockFrom.mockReturnValue(queryBuilder)
  })

  it('should fetch objectives for a quest', async () => {
    const { result } = renderHook(() => useObjectives('quest-1'), {
      wrapper: createWrapper(),
    })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toHaveLength(2)
    expect(result.current.data?.[0].title).toBe('Find the dragon lair')
    expect(result.current.data?.[1].title).toBe('Defeat the dragon')
  })

  it('should order objectives by display_order', async () => {
    const { result } = renderHook(() => useObjectives('quest-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const queryBuilder = mockFrom.mock.results[0].value
    expect(queryBuilder.order).toHaveBeenCalledWith('display_order', { ascending: true })
  })

  it('should return empty array when no objectives', async () => {
    const queryBuilder = createMockQueryBuilder([])
    mockFrom.mockReturnValue(queryBuilder)

    const { result } = renderHook(() => useObjectives('quest-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toEqual([])
  })
})

describe('useCreateObjective', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    })
  })

  it('should create an objective successfully', async () => {
    const newObjective = {
      ...mockObjectives[0],
      id: 'obj-new',
      title: 'New Objective',
    }

    const queryBuilder = createMockQueryBuilder([newObjective])
    mockFrom.mockReturnValue(queryBuilder)

    const { result } = renderHook(() => useCreateObjective(), {
      wrapper: createWrapper(),
    })

    const objectiveData: CreateObjectiveData = {
      quest_id: 'quest-1',
      title: 'New Objective',
      description: 'A new objective',
      points: 50,
      display_order: 2,
      depends_on_id: null,
      evidence_required: false,
      evidence_type: 'none',
    }

    await act(async () => {
      result.current.mutate(objectiveData)
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(mockFrom).toHaveBeenCalledWith('objectives')
  })

  it('should handle creation errors', async () => {
    const queryBuilder = createMockQueryBuilder([])
    queryBuilder.single = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'Failed to create' },
    })
    mockFrom.mockReturnValue(queryBuilder)

    const { result } = renderHook(() => useCreateObjective(), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      result.current.mutate({
        quest_id: 'quest-1',
        title: 'New Objective',
        points: 50,
        display_order: 0,
        evidence_required: false,
        evidence_type: 'none',
      })
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })
  })
})

describe('useUpdateObjective', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    })
  })

  it('should update an objective successfully', async () => {
    const updatedObjective = {
      ...mockObjectives[0],
      title: 'Updated Title',
    }

    const queryBuilder = createMockQueryBuilder([updatedObjective])
    mockFrom.mockReturnValue(queryBuilder)

    const { result } = renderHook(() => useUpdateObjective(), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      result.current.mutate({
        id: 'obj-1',
        data: { title: 'Updated Title' },
      })
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(mockFrom).toHaveBeenCalledWith('objectives')
  })
})

describe('useDeleteObjective', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    })
  })

  it('should delete an objective successfully', async () => {
    const queryBuilder = createMockQueryBuilder([])
    queryBuilder.eq = vi.fn().mockResolvedValue({ data: null, error: null })
    mockFrom.mockReturnValue(queryBuilder)

    const { result } = renderHook(() => useDeleteObjective(), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      result.current.mutate('obj-1')
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(mockFrom).toHaveBeenCalledWith('objectives')
  })
})

describe('useReorderObjectives', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    })
  })

  it('should reorder objectives', async () => {
    const queryBuilder = createMockQueryBuilder([])
    queryBuilder.eq = vi.fn().mockResolvedValue({ data: null, error: null })
    mockFrom.mockReturnValue(queryBuilder)

    const { result } = renderHook(() => useReorderObjectives(), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      result.current.mutate([
        { id: 'obj-2', display_order: 0 },
        { id: 'obj-1', display_order: 1 },
      ])
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
  })
})
