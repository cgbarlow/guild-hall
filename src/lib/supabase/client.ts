import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database.types'
import type { SupabaseClient } from '@supabase/supabase-js'

// Placeholder values for development when Supabase is not configured
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

// Singleton instance
let client: SupabaseClient<Database> | null = null

/**
 * Create a Supabase client for use in browser/client components
 * This client is used for client-side authentication and data fetching
 * Returns a singleton instance to maintain auth state (PKCE code verifier)
 *
 * Note: Returns a client with placeholder values if env vars not configured.
 * This allows the app to build without Supabase configured.
 */
export function createClient() {
  if (client) return client

  client = createBrowserClient<Database>(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  )

  return client
}

/**
 * Check if Supabase is properly configured
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}
