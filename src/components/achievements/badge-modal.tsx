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
  CalendarDays,
} from 'lucide-react'
import { cn } from '@/lib/utils'
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

interface BadgeModalProps {
  achievement: Achievement | null
  open: boolean
  onClose: () => void
}

/**
 * Modal for displaying badge/achievement details.
 * Used when clicking a badge in the BadgeShowcase component.
 */
export function BadgeModal({
  achievement,
  open,
  onClose,
}: BadgeModalProps) {
  if (!achievement) return null

  const IconComponent = iconMap[achievement.icon] ?? Trophy

  const formattedEarnedDate = new Date(achievement.earned_at).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center rounded-full h-24 w-24 bg-gradient-to-br from-amber-400 to-amber-600 shadow-xl">
              <IconComponent className="h-12 w-12 text-white" />
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
          {/* Earned status */}
          <div className="text-center py-3 rounded-lg bg-green-50 dark:bg-green-950/20">
            <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-400">
              <Trophy className="h-4 w-4" />
              <span className="font-medium">Achievement Earned!</span>
            </div>
          </div>

          {/* Earned date */}
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            <span>Earned on {formattedEarnedDate}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
