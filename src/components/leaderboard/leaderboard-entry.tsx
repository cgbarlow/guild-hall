'use client'

import { Trophy, Medal, Award, User as UserIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PointsDisplay } from '@/components/common/points-display'
import type { LeaderboardEntry } from '@/lib/hooks/use-leaderboard'

interface LeaderboardEntryRowProps {
  entry: LeaderboardEntry
  isCurrentUser?: boolean
  onClick?: () => void
  className?: string
}

/**
 * Get the appropriate icon for a rank position
 */
function getRankIcon(rank: number) {
  switch (rank) {
    case 1:
      return <Trophy className="h-5 w-5 text-amber-500 fill-amber-500" />
    case 2:
      return <Medal className="h-5 w-5 text-slate-400" />
    case 3:
      return <Award className="h-5 w-5 text-amber-700" />
    default:
      return null
  }
}

/**
 * Get styling for podium positions
 */
function getRankStyles(rank: number) {
  switch (rank) {
    case 1:
      return 'bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-800/10'
    case 2:
      return 'bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10'
    case 3:
      return 'bg-gradient-to-r from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/10'
    default:
      return ''
  }
}

/**
 * Single leaderboard row component
 */
export function LeaderboardEntryRow({
  entry,
  isCurrentUser = false,
  onClick,
  className,
}: LeaderboardEntryRowProps) {
  const rankIcon = getRankIcon(entry.rank)
  const rankStyles = getRankStyles(entry.rank)

  return (
    <div
      className={cn(
        'flex items-center gap-4 px-4 py-3 rounded-lg transition-colors',
        rankStyles,
        isCurrentUser && 'ring-2 ring-primary ring-offset-2',
        onClick && 'cursor-pointer hover:bg-muted/50',
        className
      )}
      onClick={onClick}
    >
      {/* Rank */}
      <div className="flex items-center justify-center w-10">
        {rankIcon || (
          <span className="text-lg font-semibold text-muted-foreground">
            {entry.rank}
          </span>
        )}
      </div>

      {/* Avatar */}
      <div className="flex-shrink-0">
        {entry.avatar_url ? (
          <img
            src={entry.avatar_url}
            alt={entry.display_name || 'User avatar'}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
            <UserIcon className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Name and stats */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn(
            'font-medium truncate',
            isCurrentUser && 'text-primary'
          )}>
            {entry.display_name || 'Anonymous Adventurer'}
          </span>
          {isCurrentUser && (
            <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
              You
            </span>
          )}
        </div>
        <span className="text-sm text-muted-foreground">
          {entry.quests_completed} quest{entry.quests_completed !== 1 ? 's' : ''} completed
        </span>
      </div>

      {/* Points */}
      <div className="flex-shrink-0">
        <PointsDisplay points={entry.points} size="md" />
      </div>
    </div>
  )
}

interface LeaderboardEntryCompactProps {
  entry: LeaderboardEntry
  isCurrentUser?: boolean
  onClick?: () => void
  className?: string
}

/**
 * Compact leaderboard entry for sidebar or summary displays
 */
export function LeaderboardEntryCompact({
  entry,
  isCurrentUser = false,
  onClick,
  className,
}: LeaderboardEntryCompactProps) {
  const rankIcon = getRankIcon(entry.rank)

  return (
    <div
      className={cn(
        'flex items-center gap-3 py-2 transition-colors',
        onClick && 'cursor-pointer hover:bg-muted/50 px-2 rounded',
        isCurrentUser && 'bg-primary/5',
        className
      )}
      onClick={onClick}
    >
      {/* Rank */}
      <div className="flex items-center justify-center w-6">
        {rankIcon || (
          <span className="text-sm font-medium text-muted-foreground">
            {entry.rank}
          </span>
        )}
      </div>

      {/* Avatar */}
      {entry.avatar_url ? (
        <img
          src={entry.avatar_url}
          alt={entry.display_name || 'User avatar'}
          className="h-8 w-8 rounded-full object-cover"
        />
      ) : (
        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
          <UserIcon className="h-4 w-4 text-muted-foreground" />
        </div>
      )}

      {/* Name */}
      <span className={cn(
        'flex-1 text-sm font-medium truncate',
        isCurrentUser && 'text-primary'
      )}>
        {entry.display_name || 'Anonymous'}
      </span>

      {/* Points */}
      <PointsDisplay points={entry.points} size="sm" />
    </div>
  )
}
