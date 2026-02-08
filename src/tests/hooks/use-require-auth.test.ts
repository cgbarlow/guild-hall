import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useRequireAuth } from '@/lib/hooks/use-require-auth'

// Mock useAuth
const mockUser = { id: 'user-123', email: 'test@example.com' }
let currentUser: typeof mockUser | null = mockUser

vi.mock('@/contexts/auth-context', () => ({
  useAuth: vi.fn(() => ({
    user: currentUser,
    isLoading: false,
  })),
}))

// Mock usePathname
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/quests/quest-123'),
}))

// Mock pending action storage
const mockStorePendingAction = vi.fn()
vi.mock('@/lib/auth/pending-action', () => ({
  storePendingAction: (...args: unknown[]) => mockStorePendingAction(...args),
}))

describe('useRequireAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    currentUser = mockUser
  })

  it('should return isAuthenticated=true when user exists', () => {
    const { result } = renderHook(() => useRequireAuth())

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user).toEqual(mockUser)
  })

  it('should return isAuthenticated=false when no user', () => {
    currentUser = null

    const { result } = renderHook(() => useRequireAuth())

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
  })

  it('should not show modal initially', () => {
    const { result } = renderHook(() => useRequireAuth())

    expect(result.current.showModal).toBe(false)
  })

  it('should execute action directly when authenticated', async () => {
    const action = vi.fn().mockResolvedValue('success')

    const { result } = renderHook(() => useRequireAuth())

    let actionResult: string | null = null
    await act(async () => {
      actionResult = await result.current.requireAuth(action)
    })

    expect(action).toHaveBeenCalled()
    expect(actionResult).toBe('success')
    expect(result.current.showModal).toBe(false)
  })

  it('should show modal when action attempted while unauthenticated', async () => {
    currentUser = null
    const action = vi.fn().mockResolvedValue('success')

    const { result } = renderHook(() => useRequireAuth())

    let actionResult: string | null = null
    await act(async () => {
      actionResult = await result.current.requireAuth(action)
    })

    expect(action).not.toHaveBeenCalled()
    expect(actionResult).toBeNull()
    expect(result.current.showModal).toBe(true)
  })

  it('should store pending action when modal shown', async () => {
    currentUser = null
    const action = vi.fn()
    const pendingAction = {
      type: 'accept_quest' as const,
      payload: { questId: 'quest-123' },
    }

    const { result } = renderHook(() => useRequireAuth())

    await act(async () => {
      await result.current.requireAuth(action, pendingAction)
    })

    expect(mockStorePendingAction).toHaveBeenCalledWith({
      type: 'accept_quest',
      payload: { questId: 'quest-123' },
      returnUrl: '/quests/quest-123',
    })
  })

  it('should use custom returnUrl when provided', async () => {
    currentUser = null
    const action = vi.fn()
    const pendingAction = {
      type: 'accept_quest' as const,
      payload: { questId: 'quest-123' },
    }

    const { result } = renderHook(() =>
      useRequireAuth({ returnUrl: '/custom/path' })
    )

    await act(async () => {
      await result.current.requireAuth(action, pendingAction)
    })

    expect(mockStorePendingAction).toHaveBeenCalledWith({
      type: 'accept_quest',
      payload: { questId: 'quest-123' },
      returnUrl: '/custom/path',
    })
  })

  it('should allow setShowModal to control modal visibility', () => {
    const { result } = renderHook(() => useRequireAuth())

    expect(result.current.showModal).toBe(false)

    act(() => {
      result.current.setShowModal(true)
    })

    expect(result.current.showModal).toBe(true)

    act(() => {
      result.current.setShowModal(false)
    })

    expect(result.current.showModal).toBe(false)
  })
})
