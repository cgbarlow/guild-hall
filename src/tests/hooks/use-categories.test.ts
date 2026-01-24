import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useCategories, useCategoryById } from '@/lib/hooks/use-categories'
import { createWrapper } from '@/tests/utils/test-utils'

// Mock categories data
const mockDbCategories = [
  {
    id: 'cat-uuid-1',
    name: 'Learning',
    description: 'Educational quests for skill building',
    icon: 'book-open',
    display_order: 10,
    created_at: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'cat-uuid-2',
    name: 'Challenge',
    description: 'Technical challenges that push your abilities',
    icon: 'target',
    display_order: 20,
    created_at: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'cat-uuid-3',
    name: 'Creative',
    description: 'Projects requiring innovation',
    icon: 'lightbulb',
    display_order: 30,
    created_at: '2024-01-01T00:00:00.000Z',
  },
]

// Mock Supabase client
const mockOrder = vi.fn()
const mockSelect = vi.fn()
const mockFrom = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: mockFrom,
  }),
}))

describe('useCategories', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Setup default successful mock chain
    mockOrder.mockResolvedValue({ data: mockDbCategories, error: null })
    mockSelect.mockReturnValue({ order: mockOrder })
    mockFrom.mockReturnValue({ select: mockSelect })
  })

  it('should fetch categories from database', async () => {
    const { result } = renderHook(() => useCategories(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(mockFrom).toHaveBeenCalledWith('categories')
    expect(result.current.data).toHaveLength(mockDbCategories.length)
  })

  it('should order categories by display_order', async () => {
    const { result } = renderHook(() => useCategories(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(mockOrder).toHaveBeenCalledWith('display_order', { ascending: true })
  })

  it('should handle empty results gracefully', async () => {
    mockOrder.mockResolvedValue({ data: [], error: null })

    const { result } = renderHook(() => useCategories(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual([])
  })

  it('should handle database errors', async () => {
    mockOrder.mockResolvedValue({ data: null, error: new Error('DB error') })

    const { result } = renderHook(() => useCategories(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })
  })

  it('should have valid category structure', async () => {
    const { result } = renderHook(() => useCategories(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    const firstCategory = result.current.data?.[0]
    expect(firstCategory).toHaveProperty('id')
    expect(firstCategory).toHaveProperty('name')
    expect(firstCategory).toHaveProperty('description')
    expect(firstCategory).toHaveProperty('icon')
    expect(firstCategory).toHaveProperty('display_order')
    expect(firstCategory).toHaveProperty('created_at')
  })
})

describe('useCategoryById', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockOrder.mockResolvedValue({ data: mockDbCategories, error: null })
    mockSelect.mockReturnValue({ order: mockOrder })
    mockFrom.mockReturnValue({ select: mockSelect })
  })

  it('should return a category by ID', async () => {
    const { result } = renderHook(() => useCategoryById('cat-uuid-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data?.id).toBe('cat-uuid-1')
    expect(result.current.data?.name).toBe('Learning')
  })

  it('should return undefined for non-existent ID', async () => {
    const { result } = renderHook(() => useCategoryById('non-existent'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toBeUndefined()
  })

  it('should return null when categoryId is null', async () => {
    const { result } = renderHook(() => useCategoryById(null), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toBeNull()
  })

  it('should return null when categoryId is undefined', async () => {
    const { result } = renderHook(() => useCategoryById(undefined), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toBeNull()
  })
})
