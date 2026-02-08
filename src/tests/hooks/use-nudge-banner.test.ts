import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useNudgeBanner, getRecommendedAction } from '@/lib/hooks/use-nudge-banner'
import { createWrapper } from '@/tests/utils/test-utils'
import {
  mockNudgeApprovedReady,
  mockNudgeDeadlineSoon,
  mockNudgeCelebration,
  mockNudgeQuestRecommendation,
  createMockNudgeBanner,
} from '@/tests/mocks/engagement-fixtures'

// Mock sessionStorage
const mockSessionStorage: Record<string, string> = {}
const mockGetItem = vi.fn((key: string) => mockSessionStorage[key] || null)
const mockSetItem = vi.fn((key: string, value: string) => {
  mockSessionStorage[key] = value
})
const mockRemoveItem = vi.fn((key: string) => {
  delete mockSessionStorage[key]
})

Object.defineProperty(global, 'sessionStorage', {
  value: {
    getItem: mockGetItem,
    setItem: mockSetItem,
    removeItem: mockRemoveItem,
    clear: () => {
      Object.keys(mockSessionStorage).forEach((key) => delete mockSessionStorage[key])
    },
  },
  writable: true,
})

// Mock Supabase client
const mockFrom = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: mockFrom,
  }),
}))

describe('getRecommendedAction', () => {
  describe('priority selection', () => {
    it('should return approved_ready when objectives are approved', () => {
      const context = {
        approvedObjectivesCount: 2,
        upcomingDeadlines: [],
        activeQuestsCount: 1,
        recommendedQuest: null,
        recentMilestone: null,
        badgesReadyToClaim: [],
      }

      const result = getRecommendedAction(context)

      expect(result?.priority).toBe('approved_ready')
      expect(result?.message).toContain('2 objectives')
      expect(result?.variant).toBe('info')
    })

    it('should return deadline_soon when deadline is within 3 days', () => {
      const context = {
        approvedObjectivesCount: 0,
        upcomingDeadlines: [
          { quest_id: 'q1', quest_title: 'Test Quest', days_remaining: 2 },
        ],
        activeQuestsCount: 1,
        recommendedQuest: null,
        recentMilestone: null,
        badgesReadyToClaim: [],
      }

      const result = getRecommendedAction(context)

      expect(result?.priority).toBe('deadline_soon')
      expect(result?.message).toContain('Test Quest')
      expect(result?.message).toContain('2 days')
      expect(result?.variant).toBe('warning')
    })

    it('should return celebration when there is a recent milestone', () => {
      const context = {
        approvedObjectivesCount: 0,
        upcomingDeadlines: [],
        activeQuestsCount: 1,
        recommendedQuest: null,
        recentMilestone: { type: 'tier' as const, message: 'You reached Expert tier!' },
        badgesReadyToClaim: [],
      }

      const result = getRecommendedAction(context)

      expect(result?.priority).toBe('celebration')
      expect(result?.message).toBe('You reached Expert tier!')
      expect(result?.variant).toBe('celebration')
    })

    it('should return quest_recommendation when no active quests and recommendation available', () => {
      const context = {
        approvedObjectivesCount: 0,
        upcomingDeadlines: [],
        activeQuestsCount: 0,
        recommendedQuest: { id: 'q1', title: 'Agent Swarm Commander' },
        recentMilestone: null,
        badgesReadyToClaim: [],
      }

      const result = getRecommendedAction(context)

      expect(result?.priority).toBe('quest_recommendation')
      expect(result?.message).toContain('Agent Swarm Commander')
      expect(result?.variant).toBe('info')
    })

    it('should return null when no conditions are met', () => {
      const context = {
        approvedObjectivesCount: 0,
        upcomingDeadlines: [],
        activeQuestsCount: 1,
        recommendedQuest: null,
        recentMilestone: null,
        badgesReadyToClaim: [],
      }

      const result = getRecommendedAction(context)

      expect(result).toBeNull()
    })
  })

  describe('priority ordering', () => {
    it('should prioritize approved_ready over deadline_soon', () => {
      const context = {
        approvedObjectivesCount: 1,
        upcomingDeadlines: [
          { quest_id: 'q1', quest_title: 'Test Quest', days_remaining: 2 },
        ],
        activeQuestsCount: 1,
        recommendedQuest: null,
        recentMilestone: null,
        badgesReadyToClaim: [],
      }

      const result = getRecommendedAction(context)

      expect(result?.priority).toBe('approved_ready')
    })

    it('should prioritize deadline_soon over celebration', () => {
      const context = {
        approvedObjectivesCount: 0,
        upcomingDeadlines: [
          { quest_id: 'q1', quest_title: 'Test Quest', days_remaining: 1 },
        ],
        activeQuestsCount: 1,
        recommendedQuest: null,
        recentMilestone: { type: 'tier' as const, message: 'Celebration!' },
        badgesReadyToClaim: [],
      }

      const result = getRecommendedAction(context)

      expect(result?.priority).toBe('deadline_soon')
    })

    it('should prioritize celebration over quest_recommendation', () => {
      const context = {
        approvedObjectivesCount: 0,
        upcomingDeadlines: [],
        activeQuestsCount: 0,
        recommendedQuest: { id: 'q1', title: 'Test Quest' },
        recentMilestone: { type: 'quest' as const, message: 'Quest completed!' },
        badgesReadyToClaim: [],
      }

      const result = getRecommendedAction(context)

      expect(result?.priority).toBe('celebration')
    })

    it('should not show quest_recommendation when user has active quests', () => {
      const context = {
        approvedObjectivesCount: 0,
        upcomingDeadlines: [],
        activeQuestsCount: 1,
        recommendedQuest: { id: 'q1', title: 'Test Quest' },
        recentMilestone: null,
        badgesReadyToClaim: [],
      }

      const result = getRecommendedAction(context)

      expect(result).toBeNull()
    })
  })

  describe('message formatting', () => {
    it('should pluralize objectives correctly for single', () => {
      const context = {
        approvedObjectivesCount: 1,
        upcomingDeadlines: [],
        activeQuestsCount: 1,
        recommendedQuest: null,
        recentMilestone: null,
        badgesReadyToClaim: [],
      }

      const result = getRecommendedAction(context)

      expect(result?.message).toContain('1 objective ')
      expect(result?.message).not.toContain('objectives')
    })

    it('should pluralize objectives correctly for multiple', () => {
      const context = {
        approvedObjectivesCount: 5,
        upcomingDeadlines: [],
        activeQuestsCount: 1,
        recommendedQuest: null,
        recentMilestone: null,
        badgesReadyToClaim: [],
      }

      const result = getRecommendedAction(context)

      expect(result?.message).toContain('5 objectives')
    })

    it('should pluralize days correctly for single day', () => {
      const context = {
        approvedObjectivesCount: 0,
        upcomingDeadlines: [
          { quest_id: 'q1', quest_title: 'Test Quest', days_remaining: 1 },
        ],
        activeQuestsCount: 1,
        recommendedQuest: null,
        recentMilestone: null,
        badgesReadyToClaim: [],
      }

      const result = getRecommendedAction(context)

      expect(result?.message).toContain('1 day!')
      expect(result?.message).not.toContain('days')
    })
  })

  describe('action URLs', () => {
    it('should link to active quests for approved_ready', () => {
      const context = {
        approvedObjectivesCount: 1,
        upcomingDeadlines: [],
        activeQuestsCount: 1,
        recommendedQuest: null,
        recentMilestone: null,
        badgesReadyToClaim: [],
      }

      const result = getRecommendedAction(context)

      expect(result?.actionUrl).toBe('/my-quests')
      expect(result?.actionLabel).toBe('Continue Quest')
    })

    it('should link to specific quest for deadline_soon', () => {
      const context = {
        approvedObjectivesCount: 0,
        upcomingDeadlines: [
          { quest_id: 'quest-123', quest_title: 'Test Quest', days_remaining: 2 },
        ],
        activeQuestsCount: 1,
        recommendedQuest: null,
        recentMilestone: null,
        badgesReadyToClaim: [],
      }

      const result = getRecommendedAction(context)

      expect(result?.actionUrl).toBe('/quests/quest-123')
      expect(result?.actionLabel).toBe('View Quest')
    })

    it('should link to profile for celebration', () => {
      const context = {
        approvedObjectivesCount: 0,
        upcomingDeadlines: [],
        activeQuestsCount: 1,
        recommendedQuest: null,
        recentMilestone: { type: 'tier' as const, message: 'Celebration!' },
        badgesReadyToClaim: [],
      }

      const result = getRecommendedAction(context)

      expect(result?.actionUrl).toBe('/profile')
      expect(result?.actionLabel).toBe('View Progress')
    })
  })
})

describe('useNudgeBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.keys(mockSessionStorage).forEach((key) => delete mockSessionStorage[key])
    setupDefaultMocks()
  })

  afterEach(() => {
    Object.keys(mockSessionStorage).forEach((key) => delete mockSessionStorage[key])
  })

  function setupDefaultMocks() {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'user_objectives') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              in: vi.fn().mockResolvedValue({ count: 0, error: null }),
            }),
          }),
        }
      }
      if (table === 'user_quests') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              in: vi.fn().mockReturnValue({
                not: vi.fn().mockReturnValue({
                  lte: vi.fn().mockReturnValue({
                    gte: vi.fn().mockReturnValue({
                      order: vi.fn().mockReturnValue({
                        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
                      }),
                    }),
                  }),
                }),
              }),
            }),
          }),
        }
      }
      if (table === 'quests') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                not: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue({ data: [], error: null }),
                }),
              }),
            }),
          }),
        }
      }
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }
    })
  }

  describe('loading states', () => {
    it('should not fetch when userId is undefined', async () => {
      const { result } = renderHook(() => useNudgeBanner(undefined), {
        wrapper: createWrapper(),
      })

      expect(result.current.isLoading).toBe(false)
      expect(result.current.nudge).toBeNull()
      expect(mockFrom).not.toHaveBeenCalled()
    })

    it('should not fetch when enableNudges is false', async () => {
      const { result } = renderHook(() => useNudgeBanner('user-123', false), {
        wrapper: createWrapper(),
      })

      expect(result.current.isLoading).toBe(false)
      expect(result.current.nudge).toBeNull()
    })

    it('should show loading state initially', () => {
      const { result } = renderHook(() => useNudgeBanner('user-123'), {
        wrapper: createWrapper(),
      })

      expect(result.current.isLoading).toBe(true)
    })
  })

  describe('success cases', () => {
    it('should return nudge when conditions are met', async () => {
      mockFrom.mockImplementation((table: string) => {
        if (table === 'user_objectives') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                in: vi.fn().mockResolvedValue({ count: 3, error: null }),
              }),
            }),
          }
        }
        if (table === 'user_quests') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                in: vi.fn().mockReturnValue({
                  not: vi.fn().mockReturnValue({
                    lte: vi.fn().mockReturnValue({
                      gte: vi.fn().mockReturnValue({
                        order: vi.fn().mockReturnValue({
                          limit: vi.fn().mockResolvedValue({ data: [], error: null }),
                        }),
                      }),
                    }),
                  }),
                }),
              }),
            }),
          }
        }
        if (table === 'quests') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  not: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue({ data: [], error: null }),
                  }),
                }),
              }),
            }),
          }
        }
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ count: 1, error: null }),
          }),
        }
      })

      const { result } = renderHook(() => useNudgeBanner('user-123'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.nudge).not.toBeNull()
      expect(result.current.nudge?.priority).toBe('approved_ready')
    })

    it('should return null when no nudge conditions are met', async () => {
      const { result } = renderHook(() => useNudgeBanner('user-123'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.nudge).toBeNull()
    })
  })

  describe('dismissal logic', () => {
    it('should dismiss nudge and persist to session storage', async () => {
      mockFrom.mockImplementation((table: string) => {
        if (table === 'user_objectives') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                in: vi.fn().mockResolvedValue({ count: 2, error: null }),
              }),
            }),
          }
        }
        if (table === 'user_quests') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                in: vi.fn().mockReturnValue({
                  not: vi.fn().mockReturnValue({
                    lte: vi.fn().mockReturnValue({
                      gte: vi.fn().mockReturnValue({
                        order: vi.fn().mockReturnValue({
                          limit: vi.fn().mockResolvedValue({ data: [], error: null }),
                        }),
                      }),
                    }),
                  }),
                }),
              }),
            }),
          }
        }
        if (table === 'quests') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  not: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue({ data: [], error: null }),
                  }),
                }),
              }),
            }),
          }
        }
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ count: 1, error: null }),
          }),
        }
      })

      const { result } = renderHook(() => useNudgeBanner('user-123'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.nudge).not.toBeNull()
      })

      // Dismiss the nudge
      act(() => {
        result.current.dismiss()
      })

      expect(result.current.nudge).toBeNull()
      expect(mockSetItem).toHaveBeenCalled()
    })

    it('should not show dismissed nudge', async () => {
      // Pre-populate dismissed list
      mockGetItem.mockReturnValue(JSON.stringify(['approved_ready']))

      mockFrom.mockImplementation((table: string) => {
        if (table === 'user_objectives') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                in: vi.fn().mockResolvedValue({ count: 2, error: null }),
              }),
            }),
          }
        }
        if (table === 'user_quests') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                in: vi.fn().mockReturnValue({
                  not: vi.fn().mockReturnValue({
                    lte: vi.fn().mockReturnValue({
                      gte: vi.fn().mockReturnValue({
                        order: vi.fn().mockReturnValue({
                          limit: vi.fn().mockResolvedValue({ data: [], error: null }),
                        }),
                      }),
                    }),
                  }),
                }),
              }),
            }),
          }
        }
        if (table === 'quests') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  not: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue({ data: [], error: null }),
                  }),
                }),
              }),
            }),
          }
        }
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ count: 1, error: null }),
          }),
        }
      })

      const { result } = renderHook(() => useNudgeBanner('user-123'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Should not show the dismissed nudge type
      expect(result.current.nudge).toBeNull()
    })

    it('should handle corrupted session storage gracefully', async () => {
      mockGetItem.mockReturnValue('invalid json{{{')

      const { result } = renderHook(() => useNudgeBanner('user-123'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Should still work despite corrupted storage
      expect(result.current.dismiss).toBeDefined()
    })
  })

  describe('session persistence', () => {
    it('should load dismissed state from session storage on mount', async () => {
      mockGetItem.mockReturnValue(JSON.stringify(['approved_ready', 'deadline_soon']))

      mockFrom.mockImplementation((table: string) => {
        if (table === 'user_objectives') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                in: vi.fn().mockResolvedValue({ count: 2, error: null }),
              }),
            }),
          }
        }
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ count: 0, error: null }),
          }),
        }
      })

      const { result } = renderHook(() => useNudgeBanner('user-123'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Both types should be dismissed
      expect(result.current.nudge).toBeNull()
    })

    it('should accumulate dismissed nudges', async () => {
      mockGetItem.mockReturnValue(JSON.stringify(['celebration']))

      mockFrom.mockImplementation((table: string) => {
        if (table === 'user_objectives') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                in: vi.fn().mockResolvedValue({ count: 1, error: null }),
              }),
            }),
          }
        }
        if (table === 'user_quests') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                in: vi.fn().mockReturnValue({
                  not: vi.fn().mockReturnValue({
                    lte: vi.fn().mockReturnValue({
                      gte: vi.fn().mockReturnValue({
                        order: vi.fn().mockReturnValue({
                          limit: vi.fn().mockResolvedValue({ data: [], error: null }),
                        }),
                      }),
                    }),
                  }),
                }),
              }),
            }),
          }
        }
        if (table === 'quests') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  not: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue({ data: [], error: null }),
                  }),
                }),
              }),
            }),
          }
        }
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ count: 1, error: null }),
          }),
        }
      })

      const { result } = renderHook(() => useNudgeBanner('user-123'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.nudge).not.toBeNull()
      })

      // Dismiss current nudge
      act(() => {
        result.current.dismiss()
      })

      // Should have accumulated both dismissed types
      const setItemCalls = mockSetItem.mock.calls
      const lastCall = setItemCalls[setItemCalls.length - 1]
      expect(JSON.parse(lastCall[1])).toContain('approved_ready')
    })
  })
})
