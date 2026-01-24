'use client'

import { formatDistanceToNow } from 'date-fns'
import {
  Scroll,
  CheckCircle,
  Trophy,
  Award,
  TrendingUp,
  Activity as ActivityIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Activity, ActivityWithUser, ActivityType } from '@/lib/types/activity'

interface ActivityItemProps {
  activity: Activity | ActivityWithUser
  showUser?: boolean
  className?: string
}

/**
 * Get the icon component for an activity type
 */
function getActivityIcon(type: ActivityType) {
  const iconMap: Record<ActivityType, typeof Scroll> = {
    quest_accepted: Scroll,
    objective_completed: CheckCircle,
    quest_completed: Trophy,
    badge_earned: Award,
    level_up: TrendingUp,
  }

  return iconMap[type] || ActivityIcon
}

/**
 * Get the color class for an activity type
 */
function getActivityColor(type: ActivityType): string {
  const colorMap: Record<ActivityType, string> = {
    quest_accepted: 'text-blue-500 bg-blue-50',
    objective_completed: 'text-green-500 bg-green-50',
    quest_completed: 'text-yellow-500 bg-yellow-50',
    badge_earned: 'text-purple-500 bg-purple-50',
    level_up: 'text-orange-500 bg-orange-50',
  }

  return colorMap[type] || 'text-gray-500 bg-gray-50'
}

/**
 * Single activity item component
 */
export function ActivityItem({ activity, showUser = false, className }: ActivityItemProps) {
  const Icon = getActivityIcon(activity.type)
  const colorClass = getActivityColor(activity.type)
  const user = 'user' in activity ? activity.user : null

  return (
    <div className={cn('flex items-start gap-3 py-3', className)}>
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          colorClass
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        {showUser && user && (
          <p className="text-sm font-medium text-foreground">
            {user.display_name || 'Anonymous'}
          </p>
        )}
        <p className="text-sm text-foreground">{activity.title}</p>
        {activity.description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{activity.description}</p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
        </p>
      </div>
      {activity.points_earned > 0 && (
        <div className="shrink-0 text-right">
          <span className="text-sm font-medium text-green-600">
            +{activity.points_earned}
          </span>
          <p className="text-xs text-muted-foreground">pts</p>
        </div>
      )}
    </div>
  )
}
