import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * POST /api/assign-gm
 * Assigns GM role to the current user (for development only)
 */
export async function POST() {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // Check if user already has GM role
  const { data: existingRole } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', user.id)
    .eq('role', 'gm')
    .single()

  if (existingRole) {
    return NextResponse.json({ message: 'User already has GM role', userId: user.id })
  }

  // Insert GM role (uses service role via RLS bypass for this dev endpoint)
  // Type assertion to bypass Supabase type inference issues
  const { error: insertError } = await (supabase
    .from('user_roles') as ReturnType<typeof supabase.from>)
    .insert({ user_id: user.id, role: 'gm' } as Record<string, unknown>)

  if (insertError) {
    return NextResponse.json({
      error: 'Failed to assign GM role',
      details: insertError.message
    }, { status: 500 })
  }

  return NextResponse.json({
    message: 'GM role assigned successfully',
    userId: user.id,
    email: user.email
  })
}

/**
 * GET /api/assign-gm
 * Check current user's roles
 */
export async function GET() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { data: roles } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', user.id)

  return NextResponse.json({
    userId: user.id,
    email: user.email,
    roles: roles || []
  })
}
