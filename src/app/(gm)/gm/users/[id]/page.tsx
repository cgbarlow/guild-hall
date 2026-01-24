'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { UserDetail } from '@/components/gm/users/user-detail'
import { useUserDetail } from '@/lib/hooks/use-all-users'

function UserDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-9 w-28" />
        <Skeleton className="h-8 w-48" />
      </div>
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-start gap-4 mb-6">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
      <div className="rounded-lg border bg-card p-6">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function UserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string

  const { data: user, isLoading, error } = useUserDetail(userId)

  if (isLoading) {
    return <UserDetailSkeleton />
  }

  if (error || !user) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/gm/users">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Link>
        </Button>
        <div className="text-center py-12">
          <p className="text-destructive mb-4">
            {error ? 'Failed to load user.' : 'User not found.'}
          </p>
          <Button variant="outline" onClick={() => router.push('/gm/users')}>
            Return to Users List
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/gm/users">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <User className="h-6 w-6" />
            User Details
          </h1>
        </div>
      </div>

      <UserDetail user={user} />
    </div>
  )
}
