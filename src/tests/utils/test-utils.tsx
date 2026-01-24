import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

/**
 * Create a fresh QueryClient for each test to ensure isolation
 */
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

interface WrapperProps {
  children: React.ReactNode
}

/**
 * All providers wrapper for testing
 */
function AllProviders({ children }: WrapperProps) {
  const queryClient = createTestQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

/**
 * Custom render function that wraps components with all necessary providers
 */
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllProviders, ...options })
}

/**
 * Create a wrapper with a specific QueryClient instance
 * Useful when you need to pre-populate the cache or access the client in tests
 */
function createWrapper(queryClient?: QueryClient) {
  const client = queryClient ?? createTestQueryClient()

  return function Wrapper({ children }: WrapperProps) {
    return (
      <QueryClientProvider client={client}>
        {children}
      </QueryClientProvider>
    )
  }
}

// Re-export everything from testing-library
export * from '@testing-library/react'

// Override render with custom render
export { customRender as render, createWrapper, createTestQueryClient }
