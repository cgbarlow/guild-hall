'use client'

import { useState } from 'react'
import {
  Trophy,
  Star,
  Award,
  Medal,
  Shield,
  Zap,
  Target,
  Crown,
  Flag,
  Compass,
  Gem,
  Diamond,
  Flame,
  Calendar,
  CalendarCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { BadgeModal } from '@/components/achievements/badge-modal'
import type { Achievement } from '@/lib/types/public-profile'

/**
 * Map of icon names to Lucide components
 */
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  trophy: Trophy,
  star: Star,
  stars: Star,
  award: Award,
  medal: Medal,
  shield: Shield,
  zap: Zap,
  target: Target,
  crown: Crown,
  flag: Flag,
  compass: Compass,
  gem: Gem,
  diamond: Diamond,
  fire: Flame,
  flame: Flame,
  calendar: Calendar,
  'calendar-check': CalendarCheck,
  'calendar-star': CalendarCheck,
}

interface BadgeProps {
  achievement: Achievement
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
}

/**
 * Individual badge component displaying an achievement
 */
function Badge({ achievement, size = 'md', onClick }: BadgeProps) {
  const IconComponent = iconMap[achievement.icon] ?? Trophy

  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-16 w-16',
    lg: 'h-20 w-20',
  }

  const iconSizes = {
    sm: 'h-5 w-5',
    md: 'h-7 w-7',
    lg: 'h-9 w-9',
  }

  const formattedDate = new Date(achievement.earned_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div
      className={cn(
        'group flex flex-col items-center gap-2',
        onClick && 'cursor-pointer'
      )}
      onClick={onClick}
    >
      <div
        className={cn(
          'flex items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg transition-transform group-hover:scale-110',
          sizeClasses[size]
        )}
        title={achievement.description}
      >
        <IconComponent className={cn('text-white', iconSizes[size])} />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">{achievement.name}</p>
        <p className="text-xs text-muted-foreground">{formattedDate}</p>
      </div>
    </div>
  )
}

interface BadgeShowcaseProps {
  achievements: Achievement[]
  size?: 'sm' | 'md' | 'lg'
  maxDisplay?: number
  className?: string
}

/**
 * Grid display of achievement badges
 * Shows achievements in a responsive grid layout
 * Clicking a badge opens a modal with details
 */
export function BadgeShowcase({
  achievements,
  size = 'md',
  maxDisplay,
  className,
}: BadgeShowcaseProps) {
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null)

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
          No achievements yet
        </p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {displayedAchievements.map((achievement) => (
          <Badge
            key={achievement.id}
            achievement={achievement}
            size={size}
            onClick={() => setSelectedAchievement(achievement)}
          />
        ))}
      </div>
      {remainingCount > 0 && (
        <p className="text-center text-sm text-muted-foreground">
          +{remainingCount} more achievement{remainingCount !== 1 ? 's' : ''}
        </p>
      )}

      {/* Badge detail modal */}
      <BadgeModal
        achievement={selectedAchievement}
        open={!!selectedAchievement}
        onClose={() => setSelectedAchievement(null)}
      />
    </div>
  )
}

export { Badge }
