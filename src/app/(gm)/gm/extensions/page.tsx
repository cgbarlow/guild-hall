'use client'

import { Clock, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ExtensionCard } from '@/components/gm/extensions/extension-card'
import { useExtensionRequests } from '@/lib/hooks/use-extension-requests'

function ExtensionCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex flex-col gap-2 flex-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-6 w-48" />
        </div>
        <Skeleton className="h-5 w-24 rounded-full" />
      </div>
      <Skeleton className="h-4 w-40 mb-3" />
      <Skeleton className="h-16 w-full mb-3" />
      <div className="flex items-center gap-2 pt-3 border-t">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 flex-1" />
      </div>
    </div>
  )
}

export default function ExtensionsPage() {
  const {
    data: requests,
    isLoading,
    error,
    refetch,
    isFetching
  } = useExtensionRequests()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Clock className="h-8 w-8" />
            Extension Requests
          </h1>
          <p className="text-muted-foreground">
            Review and manage deadline extension requests from users.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error ? (
        <div className="text-center py-12">
          <p className="text-destructive">Failed to load extension requests. Please try again.</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => refetch()}
          >
            Retry
          </Button>
        </div>
      ) : isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ExtensionCardSkeleton key={i} />
          ))}
        </div>
      ) : !requests || requests.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">No pending extension requests.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Extension requests from users will appear here.
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {requests.length} extension request{requests.length !== 1 ? 's' : ''} pending
          </p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {requests.map((request) => (
              <ExtensionCard key={request.id} request={request} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
