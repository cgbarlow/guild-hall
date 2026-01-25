import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useCreateQuest } from '@/lib/hooks/use-create-quest'
import { createWrapper } from '@/tests/utils/test-utils'
import type { QuestFormData } from '@/lib/schemas/quest.schema'

// Mock Supabase client
const mockInsert = vi.fn()
const mockSelect = vi.fn()
const mockSingle = vi.fn()

const mockFrom = vi.fn(() => ({
  insert: mockInsert.mockReturnValue({
    select: mockSelect.mockReturnValue({
      single: mockSingle,
    }),
  }),
}))

const mockGetUser = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    from: mockFrom,
    auth: {
      getUser: mockGetUser,
    },
  })),
}))

describe('useCreateQuest', () => {
  const mockQuestData: QuestFormData = {
    title: 'Test Quest',
    description: 'A test quest description',
    category_id: 'cat-combat',
    points: 500,
    completion_days: 7,
    reward_description: '500 points and a trophy',
    difficulty: 'Apprentice',
    resources: [],
    design_notes: null,
    narrative_context: 'In a world where...',
    transformation_goal: 'Learn to code',
    is_template: false,
    featured: false,
  }

  const mockCreatedQuest = {
    id: 'quest-new-123',
    ...mockQuestData,
    status: 'draft',
    created_by: 'gm-456',
    created_at: '2024-01-15T00:00:00.000Z',
    updated_at: '2024-01-15T00:00:00.000Z',
    published_at: null,
    archived_at: null,
    acceptance_deadline: null,
    template_id: null,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Mock authenticated GM user
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: 'gm-456',
          email: 'gm@example.com',
        },
      },
      error: null,
    })
  })

  it('should create a quest successfully', async () => {
    mockSingle.mockResolvedValue({ data: mockCreatedQuest, error: null })

    const { result } = renderHook(() => useCreateQuest(), {
      wrapper: createWrapper(),
    })

    expect(result.current.isPending).toBe(false)

    await act(async () => {
      result.current.mutate(mockQuestData)
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(mockFrom).toHaveBeenCalledWith('quests')
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        title: mockQuestData.title,
        description: mockQuestData.description,
        category_id: mockQuestData.category_id,
        points: mockQuestData.points,
        completion_days: mockQuestData.completion_days,
        created_by: 'gm-456',
        status: 'draft',
      })
    )
    expect(result.current.data).toEqual(mockCreatedQuest)
  })

  it('should create a quest with minimal data', async () => {
    const minimalData: QuestFormData = {
      title: 'Minimal Quest',
      points: 100,
      is_template: false,
      featured: false,
      difficulty: 'Apprentice',
      resources: [],
    }

    const minimalCreatedQuest = {
      ...mockCreatedQuest,
      ...minimalData,
      description: null,
      category_id: null,
      completion_days: null,
      reward_description: null,
      narrative_context: null,
      transformation_goal: null,
    }

    mockSingle.mockResolvedValue({ data: minimalCreatedQuest, error: null })

    const { result } = renderHook(() => useCreateQuest(), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      result.current.mutate(minimalData)
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Minimal Quest',
        points: 100,
        status: 'draft',
      })
    )
  })

  it('should handle database errors', async () => {
    const dbError = { message: 'Database error', code: 'PGRST116' }
    mockSingle.mockResolvedValue({ data: null, error: dbError })

    const { result } = renderHook(() => useCreateQuest(), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      result.current.mutate(mockQuestData)
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBeTruthy()
  })

  it('should handle authentication errors', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Not authenticated' },
    })

    const { result } = renderHook(() => useCreateQuest(), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      result.current.mutate(mockQuestData)
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })
  })

  it('should create a quest as a template', async () => {
    const templateData: QuestFormData = {
      ...mockQuestData,
      is_template: true,
    }

    const templateQuest = {
      ...mockCreatedQuest,
      is_template: true,
    }

    mockSingle.mockResolvedValue({ data: templateQuest, error: null })

    const { result } = renderHook(() => useCreateQuest(), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      result.current.mutate(templateData)
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        is_template: true,
      })
    )
  })

  it('should set status to draft by default', async () => {
    mockSingle.mockResolvedValue({ data: mockCreatedQuest, error: null })

    const { result } = renderHook(() => useCreateQuest(), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      result.current.mutate(mockQuestData)
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'draft',
      })
    )
  })

  it('should return the created quest with all fields', async () => {
    mockSingle.mockResolvedValue({ data: mockCreatedQuest, error: null })

    const { result } = renderHook(() => useCreateQuest(), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      result.current.mutate(mockQuestData)
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        title: mockQuestData.title,
        status: 'draft',
        created_by: 'gm-456',
        created_at: expect.any(String),
      })
    )
  })
})
