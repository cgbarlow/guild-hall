import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useUserObjectives } from '@/lib/hooks/use-user-objectives'
import { createWrapper } from '@/tests/utils/test-utils'

// Mock data for database response
const mockUserObjectives = [
  {
    id: 'uo-1',
    user_quest_id: 'uq-1',
    objective_id: 'obj-1',
    status: 'available',
    evidence_text: null,
    evidence_url: null,
    submitted_at: null,
    reviewed_by: null,
    reviewed_at: null,
    feedback: null,
    objectives: {
      id: 'obj-1',
      quest_id: 'quest-1',
      title: 'Find the dragon lair',
      description: 'Locate the entrance to the dragon lair',
      points: 100,
      display_order: 1,
      depends_on_id: null,
      evidence_required: true,
      evidence_type: 'text',
    },
  },
  {
    id: 'uo-2',
    user_quest_id: 'uq-1',
    objective_id: 'obj-2',
    status: 'locked',
    evidence_text: null,
    evidence_url: null,
    submitted_at: null,
    reviewed_by: null,
    reviewed_at: null,
    feedback: null,
    objectives: {
      id: 'obj-2',
      quest_id: 'quest-1',
      title: 'Defeat the dragon',
      description: 'Defeat the dragon and claim victory',
      points: 300,
      display_order: 2,
      depends_on_id: 'obj-1',
      evidence_required: true,
      evidence_type: 'link',
    },
  },
]

// Create a chainable mock builder
function createMockQueryBuilder(data: unknown[]) {
  const builder = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
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

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    from: mockFrom,
  })),
}))

describe('useUserObjectives', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch user objectives for a quest successfully', async () => {
    const builder = createMockQueryBuilder(mockUserObjectives)
    mockFrom.mockReturnValue(builder)

    const { result } = renderHook(() => useUserObjectives('uq-1'), {
      wrapper: createWrapper(),
    })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toHaveLength(2)
    expect(result.current.data?.[0].objective?.title).toBe('Find the dragon lair')
    expect(result.current.error).toBeNull()
  })

  it('should not fetch when userQuestId is undefined', async () => {
    const { result } = renderHook(() => useUserObjectives(undefined), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(mockFrom).not.toHaveBeenCalled()
  })

  it('should transform user objective data correctly', async () => {
    const builder = createMockQueryBuilder(mockUserObjectives)
    mockFrom.mockReturnValue(builder)

    const { result } = renderHook(() => useUserObjectives('uq-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const firstObjective = result.current.data?.[0]
    expect(firstObjective?.id).toBe('uo-1')
    expect(firstObjective?.status).toBe('available')
    expect(firstObjective?.objective?.points).toBe(100)
    expect(firstObjective?.objective?.evidence_required).toBe(true)

    const lockedObjective = result.current.data?.[1]
    expect(lockedObjective?.status).toBe('locked')
    expect(lockedObjective?.objective?.depends_on_id).toBe('obj-1')
  })
})
