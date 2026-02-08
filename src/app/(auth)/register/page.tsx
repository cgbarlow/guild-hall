import { Suspense } from 'react'
import { RegisterForm } from '@/components/auth/register-form'

export const metadata = {
  title: 'Create Account | Guild Hall',
  description: 'Create your Guild Hall account',
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-md animate-pulse" />}>
      <RegisterForm />
    </Suspense>
  )
}
