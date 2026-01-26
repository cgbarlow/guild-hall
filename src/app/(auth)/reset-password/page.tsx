'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'
import { UpdatePasswordForm } from '@/components/auth/update-password-form'

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const isUpdateMode = searchParams.get('update') === 'true'

  return (
    <>
      <h1 className="text-2xl font-bold text-center mb-6 text-foreground">
        {isUpdateMode ? 'Set New Password' : 'Reset Password'}
      </h1>
      {isUpdateMode ? <UpdatePasswordForm /> : <ResetPasswordForm />}
    </>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-center">Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  )
}
