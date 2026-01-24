import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useRequestExtension } from '@/lib/hooks/use-request-extension'
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

// Create a chainable mock builder for update operations
function createMockUpdateBuilder(data: unknown = null, error: unknown = null) {
  const builder = {
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data, error }),
  }
  return builder
}

describe('useRequestExtension', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    })
  })

  it('should request extension successfully', async () => {
    const mockUserQuest = {
      id: 'uq-1',
      extension_requested: true,
      extension_requested_at: new Date().toISOString(),
      extension_reason: 'Need more time due to personal circumstances',
    }

    const updateBuilder = createMockUpdateBuilder(mockUserQuest)
    mockFrom.mockReturnValue(updateBuilder)

    const { result } = renderHook(() => useRequestExtension(), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      result.current.mutate({
        userQuestId: 'uq-1',
        reason: 'Need more time due to personal circumstances',
      })
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(mockFrom).toHaveBeenCalledWith('user_quests')
    expect(updateBuilder.update).toHaveBeenCalled()
    expect(updateBuilder.eq).toHaveBeenCalledWith('id', 'uq-1')
    expect(updateBuilder.eq).toHaveBeenCalledWith('user_id', 'user-123')
  })

  it('should handle validation error for short reason', async () => {
    const { result } = renderHook(() => useRequestExtension(), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      result.current.mutate({
        userQuestId: 'uq-1',
        reason: 'Too short',
      })
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error?.message).toContain('10 characters')
  })

  it('should handle validation error for long reason', async () => {
    const longReason = 'x'.repeat(501)

    const { result } = renderHook(() => useRequestExtension(), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      result.current.mutate({
        userQuestId: 'uq-1',
        reason: longReason,
      })
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error?.message).toContain('500 characters')
  })

  it('should handle database error', async () => {
    const updateBuilder = createMockUpdateBuilder(null, { message: 'Database error' })
    mockFrom.mockReturnValue(updateBuilder)

    const { result } = renderHook(() => useRequestExtension(), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      result.current.mutate({
        userQuestId: 'uq-1',
        reason: 'Valid reason with enough characters',
      })
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error?.message).toBe('Database error')
  })

  it('should handle authentication error', async () => {
    mockAuth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Not authenticated' },
    })

    const { result } = renderHook(() => useRequestExtension(), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      result.current.mutate({
        userQuestId: 'uq-1',
        reason: 'Valid reason with enough characters',
      })
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error?.message).toBe('Not authenticated')
  })

  it('should call onSuccess callback when extension is requested', async () => {
    const mockUserQuest = {
      id: 'uq-1',
      extension_requested: true,
    }

    const updateBuilder = createMockUpdateBuilder(mockUserQuest)
    mockFrom.mockReturnValue(updateBuilder)

    const onSuccess = vi.fn()

    const { result } = renderHook(() => useRequestExtension({ onSuccess }), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      result.current.mutate({
        userQuestId: 'uq-1',
        reason: 'Valid reason with enough characters',
      })
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(onSuccess).toHaveBeenCalled()
  })

  it('should call onError callback when request fails', async () => {
    const updateBuilder = createMockUpdateBuilder(null, { message: 'Request failed' })
    mockFrom.mockReturnValue(updateBuilder)

    const onError = vi.fn()

    const { result } = renderHook(() => useRequestExtension({ onError }), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      result.current.mutate({
        userQuestId: 'uq-1',
        reason: 'Valid reason with enough characters',
      })
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(onError).toHaveBeenCalled()
  })

  it('should handle quest not found error', async () => {
    const updateBuilder = createMockUpdateBuilder(null, null)
    mockFrom.mockReturnValue(updateBuilder)

    const { result } = renderHook(() => useRequestExtension(), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      result.current.mutate({
        userQuestId: 'uq-nonexistent',
        reason: 'Valid reason with enough characters',
      })
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error?.message).toContain('not found')
  })
})
