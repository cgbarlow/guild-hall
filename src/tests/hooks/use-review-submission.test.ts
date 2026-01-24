import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useReviewSubmission } from '@/lib/hooks/use-review-submission'
import { createWrapper } from '@/tests/utils/test-utils'

// Mock data
const mockSubmission = {
  id: 'uo-1',
  user_quest_id: 'uq-1',
  objective_id: 'obj-1',
  status: 'approved',
  evidence_text: 'I completed the task',
  evidence_url: null,
  submitted_at: '2024-01-15T10:00:00.000Z',
  reviewed_by: 'gm-123',
  reviewed_at: '2024-01-16T10:00:00.000Z',
  feedback: 'Great job!',
}

const mockGmUser = {
  id: 'gm-123',
  email: 'gm@example.com',
}

// Create a chainable mock builder
function createMockQueryBuilder(data: unknown = null, error: Error | null = null) {
  const builder = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data, error }),
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

describe('useReviewSubmission', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: mockGmUser }, error: null })
  })

  describe('approveSubmission', () => {
    it('should approve a submission', async () => {
      const queryBuilder = createMockQueryBuilder(mockSubmission)
      mockFrom.mockReturnValue(queryBuilder)

      const { result } = renderHook(() => useReviewSubmission(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        await result.current.approveSubmission({
          userObjectiveId: 'uo-1',
          feedback: 'Great job!',
        })
      })

      expect(mockFrom).toHaveBeenCalledWith('user_objectives')
      expect(queryBuilder.update).toHaveBeenCalled()
      expect(queryBuilder.eq).toHaveBeenCalledWith('id', 'uo-1')
    })

    it('should update status to approved', async () => {
      const queryBuilder = createMockQueryBuilder(mockSubmission)
      mockFrom.mockReturnValue(queryBuilder)

      const { result } = renderHook(() => useReviewSubmission(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        await result.current.approveSubmission({
          userObjectiveId: 'uo-1',
        })
      })

      const updateCall = queryBuilder.update.mock.calls[0][0]
      expect(updateCall.status).toBe('approved')
      expect(updateCall.reviewed_by).toBe('gm-123')
      expect(updateCall.reviewed_at).toBeDefined()
    })

    it('should include optional feedback', async () => {
      const queryBuilder = createMockQueryBuilder(mockSubmission)
      mockFrom.mockReturnValue(queryBuilder)

      const { result } = renderHook(() => useReviewSubmission(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        await result.current.approveSubmission({
          userObjectiveId: 'uo-1',
          feedback: 'Excellent work!',
        })
      })

      const updateCall = queryBuilder.update.mock.calls[0][0]
      expect(updateCall.feedback).toBe('Excellent work!')
    })
  })

  describe('rejectSubmission', () => {
    it('should reject a submission', async () => {
      const rejectedSubmission = { ...mockSubmission, status: 'rejected' }
      const queryBuilder = createMockQueryBuilder(rejectedSubmission)
      mockFrom.mockReturnValue(queryBuilder)

      const { result } = renderHook(() => useReviewSubmission(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        await result.current.rejectSubmission({
          userObjectiveId: 'uo-1',
          feedback: 'Please provide more detail',
        })
      })

      expect(mockFrom).toHaveBeenCalledWith('user_objectives')
      expect(queryBuilder.update).toHaveBeenCalled()
    })

    it('should update status to rejected', async () => {
      const rejectedSubmission = { ...mockSubmission, status: 'rejected' }
      const queryBuilder = createMockQueryBuilder(rejectedSubmission)
      mockFrom.mockReturnValue(queryBuilder)

      const { result } = renderHook(() => useReviewSubmission(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        await result.current.rejectSubmission({
          userObjectiveId: 'uo-1',
          feedback: 'Please try again',
        })
      })

      const updateCall = queryBuilder.update.mock.calls[0][0]
      expect(updateCall.status).toBe('rejected')
    })

    it('should require feedback for rejection', async () => {
      const { result } = renderHook(() => useReviewSubmission(), {
        wrapper: createWrapper(),
      })

      await expect(
        act(async () => {
          await result.current.rejectSubmission({
            userObjectiveId: 'uo-1',
            feedback: '',
          })
        })
      ).rejects.toThrow('Feedback is required when rejecting a submission')
    })
  })

  it('should handle error when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })

    const { result } = renderHook(() => useReviewSubmission(), {
      wrapper: createWrapper(),
    })

    await expect(
      act(async () => {
        await result.current.approveSubmission({
          userObjectiveId: 'uo-1',
        })
      })
    ).rejects.toThrow('Not authenticated')
  })

  it('should handle database error', async () => {
    const error = new Error('Database error')
    const queryBuilder = createMockQueryBuilder(null, error)
    mockFrom.mockReturnValue(queryBuilder)

    const { result } = renderHook(() => useReviewSubmission(), {
      wrapper: createWrapper(),
    })

    await expect(
      act(async () => {
        await result.current.approveSubmission({
          userObjectiveId: 'uo-1',
        })
      })
    ).rejects.toThrow('Database error')
  })
})
