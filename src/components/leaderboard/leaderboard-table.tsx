'use client'

import { Trophy, Medal, Award, User as UserIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PointsDisplay } from '@/components/common/points-display'
import { Skeleton } from '@/components/ui/skeleton'
import type { LeaderboardEntry } from '@/lib/hooks/use-leaderboard'

interface LeaderboardTableProps {
  entries: LeaderboardEntry[]
  currentUserId?: string
  isLoading?: boolean
  onRowClick?: (entry: LeaderboardEntry) => void
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
 * Leaderboard table component displaying rankings
 */
export function LeaderboardTable({
  entries,
  currentUserId,
  isLoading = false,
  onRowClick,
  className,
}: LeaderboardTableProps) {
  if (isLoading) {
    return <LeaderboardTableSkeleton />
  }

  if (entries.length === 0) {
    return (
      <div className={cn('text-center py-12', className)}>
        <Trophy className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <p className="mt-4 text-sm text-muted-foreground">
          No adventurers on the leaderboard yet
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Complete quests to earn your place!
        </p>
      </div>
    )
  }

  return (
    <div className={cn('rounded-md border', className)}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Rank</TableHead>
            <TableHead>Adventurer</TableHead>
            <TableHead className="text-center">Quests</TableHead>
            <TableHead className="text-right">Points</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => {
            const isCurrentUser = entry.id === currentUserId
            const rankIcon = getRankIcon(entry.rank)

            return (
              <TableRow
                key={entry.id}
                className={cn(
                  onRowClick && 'cursor-pointer',
                  isCurrentUser && 'bg-primary/5',
                  entry.rank === 1 && 'bg-gradient-to-r from-amber-50 to-transparent dark:from-amber-900/10',
                  entry.rank === 2 && 'bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-900/10',
                  entry.rank === 3 && 'bg-gradient-to-r from-orange-50 to-transparent dark:from-orange-900/10'
                )}
                onClick={() => onRowClick?.(entry)}
              >
                {/* Rank */}
                <TableCell>
                  <div className="flex items-center justify-center">
                    {rankIcon || (
                      <span className="text-lg font-semibold text-muted-foreground">
                        {entry.rank}
                      </span>
                    )}
                  </div>
                </TableCell>

                {/* Adventurer */}
                <TableCell>
                  <div className="flex items-center gap-3">
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
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'font-medium',
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
                  </div>
                </TableCell>

                {/* Quests Completed */}
                <TableCell className="text-center">
                  <span className="font-medium">{entry.quests_completed}</span>
                </TableCell>

                {/* Points */}
                <TableCell className="text-right">
                  <PointsDisplay points={entry.points} size="md" />
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

/**
 * Loading skeleton for leaderboard table
 */
function LeaderboardTableSkeleton() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Rank</TableHead>
            <TableHead>Adventurer</TableHead>
            <TableHead className="text-center">Quests</TableHead>
            <TableHead className="text-right">Points</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-6 w-6 mx-auto" />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-5 w-32" />
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-8 mx-auto" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-16 ml-auto" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
