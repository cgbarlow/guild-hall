'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
  CalendarDays,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { PointsBadge } from '@/components/common/points-display'

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

interface AchievementModalProps {
  achievement: {
    id: string
    name: string
    description: string
    icon: string
    points: number
    earned: boolean
    earned_at: string | null
    created_at: string
  } | null
  open: boolean
  onClose: () => void
}

/**
 * Modal for displaying achievement details.
 */
export function AchievementModal({
  achievement,
  open,
  onClose,
}: AchievementModalProps) {
  if (!achievement) return null

  const IconComponent = iconMap[achievement.icon] ?? Trophy

  const formattedEarnedDate = achievement.earned_at
    ? new Date(achievement.earned_at).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div
              className={cn(
                'flex items-center justify-center rounded-full h-24 w-24',
                achievement.earned
                  ? 'bg-gradient-to-br from-amber-400 to-amber-600 shadow-xl'
                  : 'bg-muted'
              )}
            >
              {achievement.earned ? (
                <IconComponent className="h-12 w-12 text-white" />
              ) : (
                <Lock className="h-12 w-12 text-muted-foreground" />
              )}
            </div>
          </div>
          <DialogTitle className="text-xl text-center">
            {achievement.name}
          </DialogTitle>
          <DialogDescription className="text-center">
            {achievement.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Points reward */}
          <div className="flex items-center justify-center">
            <PointsBadge
              points={achievement.points}
              size="lg"
              variant="gradient"
            />
          </div>

          {/* Earned status */}
          <div className={cn(
            'text-center py-3 rounded-lg',
            achievement.earned
              ? 'bg-green-50 dark:bg-green-950/20'
              : 'bg-muted'
          )}>
            {achievement.earned ? (
              <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-400">
                <Trophy className="h-4 w-4" />
                <span className="font-medium">Achievement Unlocked!</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Lock className="h-4 w-4" />
                <span className="font-medium">Not Yet Earned</span>
              </div>
            )}
          </div>

          {/* Earned date */}
          {achievement.earned && formattedEarnedDate && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              <span>Earned on {formattedEarnedDate}</span>
            </div>
          )}

          {/* Hint for locked achievements */}
          {!achievement.earned && (
            <p className="text-center text-sm text-muted-foreground italic">
              Complete quests and earn points to unlock this achievement
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
