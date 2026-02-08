import { Suspense } from 'react'
import { LoginForm } from '@/components/auth/login-form'

export const metadata = {
  title: 'Sign In | Guild Hall',
  description: 'Sign in to your Guild Hall account',
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-md animate-pulse" />}>
      <LoginForm />
    </Suspense>
  )
}
