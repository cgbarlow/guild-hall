'use client'

import { useSearchParams } from 'next/navigation'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'
import { UpdatePasswordForm } from '@/components/auth/update-password-form'

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const isUpdateMode = searchParams.get('update') === 'true'

  return (
    <>
      <h1 className="text-2xl font-bold text-center mb-6">
        {isUpdateMode ? 'Set New Password' : 'Reset Password'}
      </h1>
      {isUpdateMode ? <UpdatePasswordForm /> : <ResetPasswordForm />}
    </>
  )
}
