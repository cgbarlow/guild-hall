'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ActivityItem } from './activity-item'
import type { Activity, ActivityWithUser } from '@/lib/types/activity'
import { cn } from '@/lib/utils'

interface ActivityFeedProps {
  activities: Activity[] | ActivityWithUser[]
  isLoading?: boolean
  showUser?: boolean
  title?: string
  emptyMessage?: string
  className?: string
  limit?: number
}

/**
 * Loading skeleton for activity feed
 */
function ActivityFeedSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 py-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Empty state for activity feed
 */
function ActivityFeedEmpty({ message }: { message: string }) {
  return (
    <div className="py-8 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}

/**
 * Activity feed component
 * Displays a list of activities with optional user information
 */
export function ActivityFeed({
  activities,
  isLoading = false,
  showUser = false,
  title,
  emptyMessage = 'No recent activity',
  className,
  limit,
}: ActivityFeedProps) {
  const displayedActivities = limit ? activities.slice(0, limit) : activities

  const content = (
    <>
      {isLoading ? (
        <ActivityFeedSkeleton count={limit || 5} />
      ) : displayedActivities.length === 0 ? (
        <ActivityFeedEmpty message={emptyMessage} />
      ) : (
        <div className="divide-y">
          {displayedActivities.map((activity) => (
            <ActivityItem
              key={activity.id}
              activity={activity}
              showUser={showUser}
            />
          ))}
        </div>
      )}
    </>
  )

  if (title) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>{content}</CardContent>
      </Card>
    )
  }

  return <div className={cn('', className)}>{content}</div>
}
