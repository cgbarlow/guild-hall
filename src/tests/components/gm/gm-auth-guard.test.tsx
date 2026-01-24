import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { GMAuthGuard, GMLoadingSkeleton } from '@/components/gm/gm-auth-guard'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Mock next/navigation
const mockReplace = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: vi.fn(),
    back: vi.fn(),
  }),
}))

// Mock auth context
const mockAuthContext = {
  user: null as { id: string } | null,
  session: null,
  isLoading: false,
}
vi.mock('@/contexts/auth-context', () => ({
  useAuth: () => mockAuthContext,
}))

// Mock useIsGM hook
const mockUseIsGM = {
  data: false,
  isLoading: false,
}
vi.mock('@/lib/auth/hooks', () => ({
  useIsGM: () => mockUseIsGM,
}))

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  }
}

describe('GMAuthGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuthContext.user = null
    mockAuthContext.isLoading = false
    mockUseIsGM.data = false
    mockUseIsGM.isLoading = false
  })

  it('should show loading skeleton while auth is loading', () => {
    mockAuthContext.isLoading = true
    mockAuthContext.user = null

    render(
      <GMAuthGuard>
        <div>Protected Content</div>
      </GMAuthGuard>,
      { wrapper: createWrapper() }
    )

    // Should show skeleton, not protected content
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('should show loading skeleton while GM check is loading', () => {
    mockAuthContext.isLoading = false
    mockAuthContext.user = { id: 'user-123' }
    mockUseIsGM.isLoading = true

    render(
      <GMAuthGuard>
        <div>Protected Content</div>
      </GMAuthGuard>,
      { wrapper: createWrapper() }
    )

    // Should show skeleton while checking GM status
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('should redirect to login when user is not authenticated', async () => {
    mockAuthContext.user = null
    mockAuthContext.isLoading = false

    render(
      <GMAuthGuard>
        <div>Protected Content</div>
      </GMAuthGuard>,
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/login')
    })
  })

  it('should redirect to dashboard when user is not GM', async () => {
    mockAuthContext.user = { id: 'user-123' }
    mockAuthContext.isLoading = false
    mockUseIsGM.data = false
    mockUseIsGM.isLoading = false

    render(
      <GMAuthGuard>
        <div>Protected Content</div>
      </GMAuthGuard>,
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('should render children when user is GM', async () => {
    mockAuthContext.user = { id: 'gm-user-123' }
    mockAuthContext.isLoading = false
    mockUseIsGM.data = true
    mockUseIsGM.isLoading = false

    render(
      <GMAuthGuard>
        <div>Protected Content</div>
      </GMAuthGuard>,
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })
    expect(mockReplace).not.toHaveBeenCalled()
  })

  it('should not redirect while still loading', () => {
    mockAuthContext.user = null
    mockAuthContext.isLoading = true

    render(
      <GMAuthGuard>
        <div>Protected Content</div>
      </GMAuthGuard>,
      { wrapper: createWrapper() }
    )

    // Should not redirect during loading
    expect(mockReplace).not.toHaveBeenCalled()
  })
})

describe('GMLoadingSkeleton', () => {
  it('should render skeleton elements', () => {
    render(<GMLoadingSkeleton />)

    // Should have multiple skeleton elements (via animate-pulse class)
    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })
})
