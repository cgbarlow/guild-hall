import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  // Build returnUrl from current path
  const returnUrl = encodeURIComponent(
    request.nextUrl.pathname + request.nextUrl.search
  )

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!session) {
      return NextResponse.redirect(
        new URL(`/login?returnUrl=${returnUrl}`, request.url)
      )
    }
  }

  // Protect my-quests routes
  if (request.nextUrl.pathname.startsWith('/my-quests')) {
    if (!session) {
      return NextResponse.redirect(
        new URL(`/login?returnUrl=${returnUrl}`, request.url)
      )
    }
  }

  // Protect profile route
  if (request.nextUrl.pathname === '/profile') {
    if (!session) {
      return NextResponse.redirect(
        new URL(`/login?returnUrl=${returnUrl}`, request.url)
      )
    }
  }

  // Protect settings routes
  if (request.nextUrl.pathname.startsWith('/settings')) {
    if (!session) {
      return NextResponse.redirect(
        new URL(`/login?returnUrl=${returnUrl}`, request.url)
      )
    }
  }

  // Protect notifications route
  if (request.nextUrl.pathname === '/notifications') {
    if (!session) {
      return NextResponse.redirect(
        new URL(`/login?returnUrl=${returnUrl}`, request.url)
      )
    }
  }

  // Protect GM routes
  if (request.nextUrl.pathname.startsWith('/gm')) {
    if (!session) {
      return NextResponse.redirect(
        new URL(`/login?returnUrl=${returnUrl}`, request.url)
      )
    }

    // Check GM role using has_role function (bypasses RLS issues)
    const { data: isGM, error: gmError } = await supabase.rpc('has_role', { check_role: 'gm' })
    const { data: isAdmin, error: adminError } = await supabase.rpc('has_role', { check_role: 'admin' })

    if (!isGM && !isAdmin) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // Redirect authenticated users away from auth pages
  if (session && (
    request.nextUrl.pathname === '/login' ||
    request.nextUrl.pathname === '/register'
  )) {
    // Respect returnUrl if provided, otherwise default to dashboard
    const requestedReturnUrl = request.nextUrl.searchParams.get('returnUrl')
    const redirectTo = requestedReturnUrl?.startsWith('/')
      ? requestedReturnUrl
      : '/dashboard'
    return NextResponse.redirect(new URL(redirectTo, request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/gm/:path*',
    '/my-quests/:path*',
    '/profile',
    '/settings/:path*',
    '/notifications',
    '/login',
    '/register',
  ],
}
