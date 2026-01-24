import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useAcceptQuest } from '@/lib/hooks/use-accept-quest'
import { createWrapper } from '@/tests/utils/test-utils'

// Mock Supabase client
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

// Create a chainable mock builder for insert operations
function createMockInsertBuilder(data: unknown = null, error: unknown = null) {
  const builder = {
    insert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data, error }),
  }
  return builder
}

describe('useAcceptQuest', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    })
  })

  it('should accept a quest successfully', async () => {
    const mockUserQuest = {
      id: 'user-quest-1',
      user_id: 'user-123',
      quest_id: 'quest-1',
      status: 'accepted',
      accepted_at: new Date().toISOString(),
    }

    const insertBuilder = createMockInsertBuilder(mockUserQuest)
    mockFrom.mockReturnValue(insertBuilder)

    const { result } = renderHook(() => useAcceptQuest(), {
      wrapper: createWrapper(),
    })

    expect(result.current.isPending).toBe(false)

    await act(async () => {
      result.current.mutate('quest-1')
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(mockFrom).toHaveBeenCalledWith('user_quests')
    expect(insertBuilder.insert).toHaveBeenCalled()
  })

  it('should handle error when user is not authenticated', async () => {
    mockAuth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    })

    const { result } = renderHook(() => useAcceptQuest(), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      result.current.mutate('quest-1')
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error?.message).toBe('Not authenticated')
  })

  it('should handle database error during quest acceptance', async () => {
    const insertBuilder = createMockInsertBuilder(null, { message: 'Database error' })
    mockFrom.mockReturnValue(insertBuilder)

    const { result } = renderHook(() => useAcceptQuest(), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      result.current.mutate('quest-1')
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error?.message).toBe('Database error')
  })

  it('should call onSuccess callback when quest is accepted', async () => {
    const mockUserQuest = {
      id: 'user-quest-1',
      user_id: 'user-123',
      quest_id: 'quest-1',
      status: 'accepted',
    }

    const insertBuilder = createMockInsertBuilder(mockUserQuest)
    mockFrom.mockReturnValue(insertBuilder)

    const onSuccess = vi.fn()

    const { result } = renderHook(() => useAcceptQuest({ onSuccess }), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      result.current.mutate('quest-1')
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(onSuccess).toHaveBeenCalled()
  })
})
