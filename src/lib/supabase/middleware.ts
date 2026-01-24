import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/database.types'

// Placeholder values for development when Supabase is not configured
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

/**
 * Update the Supabase session in middleware
 * This handles token refresh and session management for authenticated routes
 *
 * Note: Uses placeholder values if env vars not configured.
 * This allows the app to build without Supabase configured.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make your application
  // vulnerable to a man-in-the-middle attack.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Add user to request headers for downstream use if needed
  if (user) {
    supabaseResponse.headers.set('x-user-id', user.id)
  }

  return supabaseResponse
}
