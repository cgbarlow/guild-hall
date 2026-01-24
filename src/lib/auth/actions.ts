'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

/**
 * Sign in with email and password
 * Redirects to /dashboard on success
 * @throws Error if authentication fails
 */
export async function signIn(email: string, password: string) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw new Error(error.message)
  }

  redirect('/dashboard')
}

/**
 * Sign up with email, password, and display name
 * User will need to verify email before being able to sign in
 * @throws Error if registration fails
 */
export async function signUp(email: string, password: string, displayName: string) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: displayName,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })

  if (error) {
    throw new Error(error.message)
  }

  // Return success - user needs to verify email
  // Don't redirect here as we want to show a success message
}

/**
 * Sign out the current user
 * Redirects to /login after signing out
 */
export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

/**
 * Send a password reset email
 * @throws Error if request fails
 */
export async function resetPassword(email: string) {
  const supabase = await createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
  })

  if (error) {
    throw new Error(error.message)
  }
}

/**
 * Update user password (used after clicking reset link)
 * @throws Error if update fails
 */
export async function updatePassword(newPassword: string) {
  const supabase = await createClient()

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) {
    throw new Error(error.message)
  }

  redirect('/dashboard')
}

/**
 * Sign in with OAuth provider (Google or Apple)
 * Redirects to the OAuth provider's authentication page
 * @throws Error if OAuth initiation fails
 */
export async function signInWithOAuth(provider: 'google' | 'apple') {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })

  if (error) {
    throw new Error(error.message)
  }

  if (data.url) {
    redirect(data.url)
  }
}

/**
 * Get the current authenticated user from the server
 * Returns null if not authenticated
 */
export async function getUser() {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) {
    return null
  }

  return user
}

/**
 * Get the current session from the server
 * Returns null if no active session
 */
export async function getSession() {
  const supabase = await createClient()

  const { data: { session }, error } = await supabase.auth.getSession()

  if (error) {
    return null
  }

  return session
}
