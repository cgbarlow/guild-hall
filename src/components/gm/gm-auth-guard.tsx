'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { useIsGM } from '@/lib/auth/hooks'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * Loading skeleton for GM pages
 */
function GMLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header skeleton */}
      <div className="h-16 border-b bg-card">
        <div className="flex items-center gap-4 px-4 py-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-24" />
        </div>
      </div>
      {/* Nav skeleton */}
      <div className="border-b bg-card">
        <div className="flex gap-4 px-4 py-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
      {/* Content skeleton */}
      <div className="flex">
        {/* Sidebar skeleton */}
        <div className="hidden w-64 border-r bg-card p-4 lg:block">
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        {/* Main content skeleton */}
        <div className="flex-1 p-8">
          <Skeleton className="mb-4 h-8 w-64" />
          <Skeleton className="mb-8 h-4 w-96" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Auth guard component for GM pages
 * Redirects non-GMs to dashboard, unauthenticated users to login
 */
export function GMAuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authLoading } = useAuth()
  const { data: isGM, isLoading: gmLoading } = useIsGM()
  const router = useRouter()

  // Handle redirects
  useEffect(() => {
    // Wait for loading to complete
    if (authLoading || gmLoading) {
      return
    }

    // Redirect if not authenticated
    if (!user) {
      router.replace('/login')
      return
    }

    // Redirect if not GM (once we know for sure)
    if (isGM === false) {
      router.replace('/dashboard')
    }
  }, [user, isGM, authLoading, gmLoading, router])

  // Show loading state while checking auth
  if (authLoading || gmLoading) {
    return <GMLoadingSkeleton />
  }

  // Don't render children until we confirm user is GM
  // This prevents flash of content before redirect
  if (!user || !isGM) {
    return <GMLoadingSkeleton />
  }

  return <>{children}</>
}

export { GMLoadingSkeleton }
