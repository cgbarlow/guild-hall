import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import {
  storePendingAction,
  getPendingAction,
  clearPendingAction,
  isExpired,
  validateReturnUrl,
  type PendingAction,
} from '@/lib/auth/pending-action'

describe('pending-action utilities', () => {
  beforeEach(() => {
    // Clear sessionStorage before each test
    sessionStorage.clear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('storePendingAction', () => {
    it('should store action with timestamp', () => {
      const now = Date.now()
      vi.setSystemTime(now)

      storePendingAction({
        type: 'accept_quest',
        payload: { questId: 'quest-123' },
        returnUrl: '/quests/quest-123',
      })

      const stored = sessionStorage.getItem('guild-hall-pending-action')
      expect(stored).not.toBeNull()

      const parsed = JSON.parse(stored!)
      expect(parsed.type).toBe('accept_quest')
      expect(parsed.payload.questId).toBe('quest-123')
      expect(parsed.returnUrl).toBe('/quests/quest-123')
      expect(parsed.timestamp).toBe(now)
    })
  })

  describe('getPendingAction', () => {
    it('should return null when no pending action', () => {
      const result = getPendingAction()
      expect(result).toBeNull()
    })

    it('should retrieve stored action', () => {
      const now = Date.now()
      vi.setSystemTime(now)

      storePendingAction({
        type: 'accept_quest',
        payload: { questId: 'quest-123' },
        returnUrl: '/quests/quest-123',
      })

      const result = getPendingAction()

      expect(result).not.toBeNull()
      expect(result!.type).toBe('accept_quest')
      expect(result!.payload.questId).toBe('quest-123')
    })

    it('should return null for expired actions', () => {
      const now = Date.now()
      vi.setSystemTime(now)

      storePendingAction({
        type: 'accept_quest',
        payload: { questId: 'quest-123' },
        returnUrl: '/quests/quest-123',
      })

      // Advance time by 11 minutes (beyond 10 minute TTL)
      vi.advanceTimersByTime(11 * 60 * 1000)

      const result = getPendingAction()
      expect(result).toBeNull()
    })

    it('should clear expired actions from storage', () => {
      const now = Date.now()
      vi.setSystemTime(now)

      storePendingAction({
        type: 'accept_quest',
        payload: { questId: 'quest-123' },
        returnUrl: '/quests/quest-123',
      })

      // Advance time by 11 minutes
      vi.advanceTimersByTime(11 * 60 * 1000)

      getPendingAction()

      // Verify it was cleared
      const stored = sessionStorage.getItem('guild-hall-pending-action')
      expect(stored).toBeNull()
    })
  })

  describe('clearPendingAction', () => {
    it('should remove action from storage', () => {
      storePendingAction({
        type: 'accept_quest',
        payload: { questId: 'quest-123' },
        returnUrl: '/quests/quest-123',
      })

      clearPendingAction()

      const stored = sessionStorage.getItem('guild-hall-pending-action')
      expect(stored).toBeNull()
    })

    it('should not throw when no action exists', () => {
      expect(() => clearPendingAction()).not.toThrow()
    })
  })

  describe('isExpired', () => {
    it('should return false for recent actions', () => {
      const now = Date.now()
      vi.setSystemTime(now)

      const action: PendingAction = {
        type: 'accept_quest',
        payload: { questId: 'quest-123' },
        returnUrl: '/quests/quest-123',
        timestamp: now - 5 * 60 * 1000, // 5 minutes ago
      }

      expect(isExpired(action)).toBe(false)
    })

    it('should return true for actions older than 10 minutes', () => {
      const now = Date.now()
      vi.setSystemTime(now)

      const action: PendingAction = {
        type: 'accept_quest',
        payload: { questId: 'quest-123' },
        returnUrl: '/quests/quest-123',
        timestamp: now - 11 * 60 * 1000, // 11 minutes ago
      }

      expect(isExpired(action)).toBe(true)
    })

    it('should return false for exactly 10 minute old actions', () => {
      const now = Date.now()
      vi.setSystemTime(now)

      const action: PendingAction = {
        type: 'accept_quest',
        payload: { questId: 'quest-123' },
        returnUrl: '/quests/quest-123',
        timestamp: now - 10 * 60 * 1000, // exactly 10 minutes ago
      }

      // Exactly at boundary should NOT be expired
      expect(isExpired(action)).toBe(false)
    })
  })

  describe('validateReturnUrl', () => {
    it('should return /dashboard for null input', () => {
      expect(validateReturnUrl(null)).toBe('/dashboard')
    })

    it('should return /dashboard for non-relative URLs', () => {
      expect(validateReturnUrl('https://evil.com')).toBe('/dashboard')
      expect(validateReturnUrl('http://malicious.site')).toBe('/dashboard')
      expect(validateReturnUrl('javascript:alert(1)')).toBe('/dashboard')
    })

    it('should accept relative URLs', () => {
      expect(validateReturnUrl('/quests/quest-123')).toBe('/quests/quest-123')
      expect(validateReturnUrl('/dashboard')).toBe('/dashboard')
      expect(validateReturnUrl('/my-quests')).toBe('/my-quests')
    })

    it('should reject URLs not starting with /', () => {
      expect(validateReturnUrl('quests/quest-123')).toBe('/dashboard')
      expect(validateReturnUrl('')).toBe('/dashboard')
    })
  })
})
