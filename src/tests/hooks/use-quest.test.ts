import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useQuest } from '@/lib/hooks/use-quest'
import { createWrapper } from '@/tests/utils/test-utils'

// Mock data for database response
const mockDbQuest = {
  id: 'quest-1',
  guild_id: 'guild-1',
  title: 'Defeat the Dragon',
  description: 'A fearsome dragon terrorizes the village. Your task is to defeat it and save the villagers.',
  status: 'open',
  xp_reward: 500,
  created_by: 'gm-1',
  claimed_by: null,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
}

// Create a chainable mock builder
function createMockQueryBuilder(data: unknown) {
  const builder = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data, error: null }),
  }
  return builder
}

const mockFrom = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    from: mockFrom,
  })),
}))

describe('useQuest', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch quest by id successfully', async () => {
    const questBuilder = createMockQueryBuilder(mockDbQuest)
    mockFrom.mockReturnValue(questBuilder)

    const { result } = renderHook(() => useQuest('quest-1'), {
      wrapper: createWrapper(),
    })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data?.id).toBe('quest-1')
    expect(result.current.data?.title).toBe('Defeat the Dragon')
    expect(result.current.error).toBeNull()
  })

  it('should handle error when quest not found', async () => {
    const error = { message: 'Quest not found', code: 'PGRST116' }
    const questBuilder = createMockQueryBuilder(null)
    questBuilder.single = vi.fn().mockResolvedValue({ data: null, error })

    mockFrom.mockReturnValue(questBuilder)

    const { result } = renderHook(() => useQuest('non-existent'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBeTruthy()
  })

  it('should call supabase with correct quest id', async () => {
    const questBuilder = createMockQueryBuilder(mockDbQuest)
    mockFrom.mockReturnValue(questBuilder)

    const { result } = renderHook(() => useQuest('quest-123'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(mockFrom).toHaveBeenCalledWith('quests')
    expect(questBuilder.eq).toHaveBeenCalledWith('id', 'quest-123')
  })

  it('should not fetch when questId is undefined', async () => {
    const { result } = renderHook(() => useQuest(undefined), {
      wrapper: createWrapper(),
    })

    // Should not be loading because query is disabled
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(mockFrom).not.toHaveBeenCalled()
  })

  it('should transform quest data to expected format', async () => {
    const questBuilder = createMockQueryBuilder(mockDbQuest)
    mockFrom.mockReturnValue(questBuilder)

    const { result } = renderHook(() => useQuest('quest-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const quest = result.current.data
    expect(quest?.points).toBe(500)
    expect(quest?.xp_reward).toBe(500)
    expect(quest?.status).toBe('open')
    expect(quest?.objectives).toEqual([])
  })
})
