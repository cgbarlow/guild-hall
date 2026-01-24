import { vi } from 'vitest'
import type { User, Session } from '@supabase/supabase-js'

/**
 * Mock Supabase auth user
 */
export const mockAuthUser: User = {
  id: 'user-123',
  email: 'test@example.com',
  app_metadata: {},
  user_metadata: {
    display_name: 'Test User',
  },
  aud: 'authenticated',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
  role: 'authenticated',
  phone: '',
  confirmed_at: '2024-01-01T00:00:00.000Z',
  email_confirmed_at: '2024-01-01T00:00:00.000Z',
  last_sign_in_at: '2024-01-01T00:00:00.000Z',
  is_anonymous: false,
  identities: [],
  factors: [],
}

/**
 * Mock Supabase session
 */
export const mockSession: Session = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: 'bearer',
  user: mockAuthUser,
}

/**
 * Create mock auth methods
 */
export function createMockAuth() {
  return {
    getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    signInWithPassword: vi.fn().mockResolvedValue({ data: { session: mockSession, user: mockAuthUser }, error: null }),
    signUp: vi.fn().mockResolvedValue({ data: { session: null, user: mockAuthUser }, error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    resetPasswordForEmail: vi.fn().mockResolvedValue({ data: {}, error: null }),
    updateUser: vi.fn().mockResolvedValue({ data: { user: mockAuthUser }, error: null }),
    signInWithOAuth: vi.fn().mockResolvedValue({ data: { url: 'https://oauth.example.com' }, error: null }),
    onAuthStateChange: vi.fn().mockReturnValue({
      data: {
        subscription: {
          unsubscribe: vi.fn(),
        },
      },
    }),
  }
}

/**
 * Create mock query builder for Supabase queries
 */
export function createMockQueryBuilder<T>(data: T[] = []) {
  const builder = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    like: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    contains: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: data[0] ?? null, error: null }),
    maybeSingle: vi.fn().mockResolvedValue({ data: data[0] ?? null, error: null }),
    then: vi.fn().mockImplementation((resolve) => resolve({ data, error: null })),
  }

  // Make the builder thenable (awaitable)
  Object.defineProperty(builder, 'then', {
    value: (resolve: (value: { data: T[]; error: null }) => void) => {
      return Promise.resolve({ data, error: null }).then(resolve)
    },
  })

  return builder
}

/**
 * Create a complete mock Supabase client
 */
export function createMockSupabaseClient() {
  const auth = createMockAuth()

  return {
    auth,
    from: vi.fn().mockImplementation(() => createMockQueryBuilder()),
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({ data: { path: 'test-path' }, error: null }),
        download: vi.fn().mockResolvedValue({ data: new Blob(), error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/file.jpg' } }),
        remove: vi.fn().mockResolvedValue({ data: [], error: null }),
        list: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
    },
    channel: vi.fn().mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnValue({ unsubscribe: vi.fn() }),
    }),
    removeChannel: vi.fn(),
  }
}

/**
 * Mock for the createClient function from @/lib/supabase/client
 */
export const mockCreateClient = vi.fn().mockReturnValue(createMockSupabaseClient())

/**
 * Setup mock for Supabase client module
 * Call this in your test file before running tests
 */
export function setupSupabaseMock() {
  vi.mock('@/lib/supabase/client', () => ({
    createClient: mockCreateClient,
    isSupabaseConfigured: vi.fn().mockReturnValue(true),
  }))

  vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn().mockReturnValue(createMockSupabaseClient()),
  }))
}
