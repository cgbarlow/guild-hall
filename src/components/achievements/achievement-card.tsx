'use client'

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
  Lock,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { PointsDisplay } from '@/components/common/points-display'

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

interface AchievementCardProps {
  id: string
  name: string
  description: string
  icon: string
  points: number
  earned: boolean
  earned_at?: string | null
  onClick?: () => void
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

/**
 * Achievement card component displaying a single achievement.
 * Shows earned/locked status with appropriate styling.
 */
export function AchievementCard({
  name,
  description,
  icon,
  points,
  earned,
  earned_at,
  onClick,
  size = 'md',
  className,
}: AchievementCardProps) {
  const IconComponent = iconMap[icon] ?? Trophy

  const sizeClasses = {
    sm: {
      card: 'p-3',
      icon: 'h-10 w-10',
      iconInner: 'h-5 w-5',
      title: 'text-sm',
      description: 'text-xs',
    },
    md: {
      card: 'p-4',
      icon: 'h-14 w-14',
      iconInner: 'h-7 w-7',
      title: 'text-base',
      description: 'text-sm',
    },
    lg: {
      card: 'p-6',
      icon: 'h-18 w-18',
      iconInner: 'h-9 w-9',
      title: 'text-lg',
      description: 'text-base',
    },
  }

  const sizes = sizeClasses[size]

  const formattedDate = earned_at
    ? new Date(earned_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null

  return (
    <Card
      className={cn(
        'transition-all duration-200',
        earned && 'hover:shadow-md',
        !earned && 'opacity-60 grayscale',
        onClick && earned && 'cursor-pointer hover:scale-[1.02]',
        className
      )}
      onClick={earned ? onClick : undefined}
    >
      <CardContent className={cn('flex items-start gap-4', sizes.card)}>
        {/* Achievement Icon */}
        <div
          className={cn(
            'flex-shrink-0 flex items-center justify-center rounded-full',
            sizes.icon,
            earned
              ? 'bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg'
              : 'bg-muted'
          )}
        >
          {earned ? (
            <IconComponent className={cn('text-white', sizes.iconInner)} />
          ) : (
            <Lock className={cn('text-muted-foreground', sizes.iconInner)} />
          )}
        </div>

        {/* Achievement Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className={cn('font-semibold', sizes.title)}>{name}</h3>
            <PointsDisplay points={points} size="sm" />
          </div>
          <p className={cn('text-muted-foreground mt-1 line-clamp-2', sizes.description)}>
            {description}
          </p>
          {earned && formattedDate && (
            <p className="text-xs text-muted-foreground mt-2">
              Earned on {formattedDate}
            </p>
          )}
          {!earned && (
            <p className="text-xs text-muted-foreground mt-2 italic">
              Not yet earned
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface AchievementBadgeProps {
  name: string
  icon: string
  earned: boolean
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  className?: string
}

/**
 * Compact achievement badge for displaying in grids or lists.
 */
export function AchievementBadge({
  name,
  icon,
  earned,
  size = 'md',
  onClick,
  className,
}: AchievementBadgeProps) {
  const IconComponent = iconMap[icon] ?? Trophy

  const sizeClasses = {
    sm: {
      container: 'h-10 w-10',
      icon: 'h-5 w-5',
    },
    md: {
      container: 'h-14 w-14',
      icon: 'h-7 w-7',
    },
    lg: {
      container: 'h-18 w-18',
      icon: 'h-9 w-9',
    },
  }

  const sizes = sizeClasses[size]

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-1.5',
        onClick && earned && 'cursor-pointer',
        className
      )}
      onClick={earned ? onClick : undefined}
      title={name}
    >
      <div
        className={cn(
          'flex items-center justify-center rounded-full transition-all duration-200',
          sizes.container,
          earned
            ? 'bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg hover:scale-110'
            : 'bg-muted opacity-40'
        )}
      >
        {earned ? (
          <IconComponent className={cn('text-white', sizes.icon)} />
        ) : (
          <Lock className={cn('text-muted-foreground', sizes.icon)} />
        )}
      </div>
      <span className={cn(
        'text-xs text-center font-medium max-w-[80px] truncate',
        !earned && 'text-muted-foreground'
      )}>
        {name}
      </span>
    </div>
  )
}
