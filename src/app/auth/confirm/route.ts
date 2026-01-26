import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { EmailOtpType } from '@supabase/supabase-js'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/dashboard'

  // Determine redirect URL based on type
  let redirectTo = next
  if (type === 'recovery') {
    redirectTo = '/reset-password?update=true'
  } else if (type === 'signup' || type === 'email' || type === 'email_change' || type === 'invite' || type === 'magiclink') {
    redirectTo = '/dashboard'
  }

  if (token_hash && type) {
    const supabase = await createClient()

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })

    if (error) {
      redirect(`/auth/error?message=${encodeURIComponent(error.message)}`)
    }

    redirect(redirectTo)
  }

  redirect('/auth/error?message=Missing+token+hash+or+type')
}
