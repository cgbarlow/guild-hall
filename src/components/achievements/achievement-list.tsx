'use client'

import { useState } from 'react'
import { Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AchievementCard, AchievementBadge } from './achievement-card'
import { AchievementModal } from './achievement-modal'
import type { UserAchievementWithDetails } from '@/lib/hooks/use-achievements'

interface AchievementListProps {
  achievements: UserAchievementWithDetails[]
  view?: 'grid' | 'list' | 'badges'
  showLocked?: boolean
  maxDisplay?: number
  className?: string
}

/**
 * Grid/list display of achievements.
 * Supports different view modes and filtering locked achievements.
 */
export function AchievementList({
  achievements,
  view = 'grid',
  showLocked = true,
  maxDisplay,
  className,
}: AchievementListProps) {
  const [selectedAchievement, setSelectedAchievement] = useState<UserAchievementWithDetails | null>(null)

  // Filter achievements based on showLocked preference
  const filteredAchievements = showLocked
    ? achievements
    : achievements.filter((a) => a.earned)

  // Apply maxDisplay limit if provided
  const displayedAchievements = maxDisplay
    ? filteredAchievements.slice(0, maxDisplay)
    : filteredAchievements

  const remainingCount = maxDisplay
    ? Math.max(0, filteredAchievements.length - maxDisplay)
    : 0

  const earnedCount = achievements.filter((a) => a.earned).length
  const totalCount = achievements.length

  if (achievements.length === 0) {
    return (
      <div className={cn('text-center py-8', className)}>
        <Trophy className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <p className="mt-2 text-sm text-muted-foreground">
          No achievements available
        </p>
      </div>
    )
  }

  if (filteredAchievements.length === 0) {
    return (
      <div className={cn('text-center py-8', className)}>
        <Trophy className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <p className="mt-2 text-sm text-muted-foreground">
          No achievements earned yet
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Complete quests to earn achievements
        </p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Progress summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {earnedCount} of {totalCount} achievements earned
        </span>
        <span className="text-xs">
          {Math.round((earnedCount / totalCount) * 100)}% complete
        </span>
      </div>

      {/* Achievements display */}
      {view === 'badges' ? (
        <div className="flex flex-wrap gap-4 justify-center">
          {displayedAchievements.map((achievement) => (
            <AchievementBadge
              key={achievement.id}
              name={achievement.name}
              icon={achievement.icon}
              earned={achievement.earned}
              onClick={() => setSelectedAchievement(achievement)}
            />
          ))}
        </div>
      ) : view === 'list' ? (
        <div className="space-y-3">
          {displayedAchievements.map((achievement) => (
            <AchievementCard
              key={achievement.id}
              id={achievement.id}
              name={achievement.name}
              description={achievement.description}
              icon={achievement.icon}
              points={achievement.points}
              earned={achievement.earned}
              earned_at={achievement.earned_at}
              onClick={() => setSelectedAchievement(achievement)}
              size="sm"
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {displayedAchievements.map((achievement) => (
            <AchievementCard
              key={achievement.id}
              id={achievement.id}
              name={achievement.name}
              description={achievement.description}
              icon={achievement.icon}
              points={achievement.points}
              earned={achievement.earned}
              earned_at={achievement.earned_at}
              onClick={() => setSelectedAchievement(achievement)}
            />
          ))}
        </div>
      )}

      {/* Show remaining count */}
      {remainingCount > 0 && (
        <p className="text-center text-sm text-muted-foreground">
          +{remainingCount} more achievement{remainingCount !== 1 ? 's' : ''}
        </p>
      )}

      {/* Achievement detail modal */}
      <AchievementModal
        achievement={selectedAchievement}
        open={!!selectedAchievement}
        onClose={() => setSelectedAchievement(null)}
      />
    </div>
  )
}

interface EarnedAchievementListProps {
  achievements: Array<{
    id: string
    name: string
    description: string
    icon: string
    points: number
    earned_at: string
  }>
  view?: 'grid' | 'list' | 'badges'
  maxDisplay?: number
  className?: string
}

/**
 * List specifically for earned achievements (for public profiles).
 */
export function EarnedAchievementList({
  achievements,
  view = 'badges',
  maxDisplay,
  className,
}: EarnedAchievementListProps) {
  const [selectedAchievement, setSelectedAchievement] = useState<(typeof achievements)[0] | null>(null)

  const displayedAchievements = maxDisplay
    ? achievements.slice(0, maxDisplay)
    : achievements

  const remainingCount = maxDisplay
    ? Math.max(0, achievements.length - maxDisplay)
    : 0

  if (achievements.length === 0) {
    return (
      <div className={cn('text-center py-8', className)}>
        <Trophy className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <p className="mt-2 text-sm text-muted-foreground">
          No achievements earned yet
        </p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {view === 'badges' ? (
        <div className="flex flex-wrap gap-4 justify-center">
          {displayedAchievements.map((achievement) => (
            <AchievementBadge
              key={achievement.id}
              name={achievement.name}
              icon={achievement.icon}
              earned={true}
              onClick={() => setSelectedAchievement(achievement)}
            />
          ))}
        </div>
      ) : view === 'list' ? (
        <div className="space-y-3">
          {displayedAchievements.map((achievement) => (
            <AchievementCard
              key={achievement.id}
              id={achievement.id}
              name={achievement.name}
              description={achievement.description}
              icon={achievement.icon}
              points={achievement.points}
              earned={true}
              earned_at={achievement.earned_at}
              onClick={() => setSelectedAchievement(achievement)}
              size="sm"
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {displayedAchievements.map((achievement) => (
            <AchievementCard
              key={achievement.id}
              id={achievement.id}
              name={achievement.name}
              description={achievement.description}
              icon={achievement.icon}
              points={achievement.points}
              earned={true}
              earned_at={achievement.earned_at}
              onClick={() => setSelectedAchievement(achievement)}
            />
          ))}
        </div>
      )}

      {remainingCount > 0 && (
        <p className="text-center text-sm text-muted-foreground">
          +{remainingCount} more achievement{remainingCount !== 1 ? 's' : ''}
        </p>
      )}

      {/* Achievement detail modal */}
      {selectedAchievement && (
        <AchievementModal
          achievement={{
            ...selectedAchievement,
            earned: true,
            earned_at: selectedAchievement.earned_at,
            created_at: '',
          }}
          open={!!selectedAchievement}
          onClose={() => setSelectedAchievement(null)}
        />
      )}
    </div>
  )
}
