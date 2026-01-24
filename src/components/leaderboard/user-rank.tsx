'use client'

import { Trophy, TrendingUp, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface UserRankProps {
  rank: number | null
  total: number
  isLoading?: boolean
  className?: string
}

/**
 * Display the current user's rank on the leaderboard
 */
export function UserRank({
  rank,
  total,
  isLoading = false,
  className,
}: UserRankProps) {
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Your Rank
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-4 w-32 mt-1" />
        </CardContent>
      </Card>
    )
  }

  if (rank === null) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Your Rank
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground">
            <EyeOff className="h-5 w-5" />
            <span className="text-sm">Not on leaderboard</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Enable leaderboard visibility in privacy settings to appear
          </p>
        </CardContent>
      </Card>
    )
  }

  const percentile = Math.round((1 - (rank - 1) / total) * 100)

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Trophy className="h-4 w-4" />
          Your Rank
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold">#{rank}</span>
          <span className="text-sm text-muted-foreground">of {total}</span>
        </div>
        {percentile >= 50 && (
          <div className="flex items-center gap-1 mt-1 text-sm text-green-600 dark:text-green-400">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Top {100 - percentile + 1}%</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface UserRankBadgeProps {
  rank: number | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

/**
 * Compact rank badge for inline display
 */
export function UserRankBadge({
  rank,
  size = 'md',
  className,
}: UserRankBadgeProps) {
  if (rank === null) {
    return (
      <div className={cn(
        'inline-flex items-center gap-1 text-muted-foreground',
        size === 'sm' && 'text-xs',
        size === 'md' && 'text-sm',
        size === 'lg' && 'text-base',
        className
      )}>
        <EyeOff className={cn(
          size === 'sm' && 'h-3 w-3',
          size === 'md' && 'h-3.5 w-3.5',
          size === 'lg' && 'h-4 w-4'
        )} />
        <span>Unranked</span>
      </div>
    )
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-sm gap-1.5',
    lg: 'px-3 py-1.5 text-base gap-2',
  }

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4',
  }

  return (
    <div className={cn(
      'inline-flex items-center font-semibold rounded-full bg-primary/10 text-primary',
      sizeClasses[size],
      className
    )}>
      <Trophy className={iconSizes[size]} />
      <span>#{rank}</span>
    </div>
  )
}
