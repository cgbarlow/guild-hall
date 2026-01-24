import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database.types'

// Placeholder values for development when Supabase is not configured
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

/**
 * Create a Supabase client for use in browser/client components
 * This client is used for client-side authentication and data fetching
 *
 * Note: Returns a client with placeholder values if env vars not configured.
 * This allows the app to build without Supabase configured.
 */
export function createClient() {
  return createBrowserClient<Database>(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  )
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
