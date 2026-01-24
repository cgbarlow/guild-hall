import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useSubmitEvidence } from '@/lib/hooks/use-submit-evidence'
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

describe('useSubmitEvidence', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    })
  })

  it('should submit text evidence successfully', async () => {
    const mockUserObjective = {
      id: 'uo-1',
      status: 'submitted',
      evidence_text: 'My evidence text',
      submitted_at: new Date().toISOString(),
    }

    const updateBuilder = createMockUpdateBuilder(mockUserObjective)
    mockFrom.mockReturnValue(updateBuilder)

    const { result } = renderHook(() => useSubmitEvidence(), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      result.current.mutate({
        userObjectiveId: 'uo-1',
        evidenceText: 'My evidence text',
      })
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(mockFrom).toHaveBeenCalledWith('user_objectives')
    expect(updateBuilder.update).toHaveBeenCalled()
  })

  it('should submit URL evidence successfully', async () => {
    const mockUserObjective = {
      id: 'uo-1',
      status: 'submitted',
      evidence_url: 'https://example.com/proof',
      submitted_at: new Date().toISOString(),
    }

    const updateBuilder = createMockUpdateBuilder(mockUserObjective)
    mockFrom.mockReturnValue(updateBuilder)

    const { result } = renderHook(() => useSubmitEvidence(), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      result.current.mutate({
        userObjectiveId: 'uo-1',
        evidenceUrl: 'https://example.com/proof',
      })
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
  })

  it('should handle validation error for missing evidence', async () => {
    const { result } = renderHook(() => useSubmitEvidence(), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      result.current.mutate({
        userObjectiveId: 'uo-1',
      })
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error?.message).toContain('evidence')
  })

  it('should handle database error', async () => {
    const updateBuilder = createMockUpdateBuilder(null, { message: 'Database error' })
    mockFrom.mockReturnValue(updateBuilder)

    const { result } = renderHook(() => useSubmitEvidence(), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      result.current.mutate({
        userObjectiveId: 'uo-1',
        evidenceText: 'Test evidence',
      })
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error?.message).toBe('Database error')
  })

  it('should call onSuccess callback when evidence is submitted', async () => {
    const mockUserObjective = {
      id: 'uo-1',
      status: 'submitted',
    }

    const updateBuilder = createMockUpdateBuilder(mockUserObjective)
    mockFrom.mockReturnValue(updateBuilder)

    const onSuccess = vi.fn()

    const { result } = renderHook(() => useSubmitEvidence({ onSuccess }), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      result.current.mutate({
        userObjectiveId: 'uo-1',
        evidenceText: 'Evidence',
      })
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(onSuccess).toHaveBeenCalled()
  })
})
