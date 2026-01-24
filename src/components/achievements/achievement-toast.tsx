'use client'

import { useEffect, useState } from 'react'
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
  Fire,
  Calendar,
  CalendarCheck,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
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
  fire: Fire,
  calendar: Calendar,
  'calendar-check': CalendarCheck,
  'calendar-star': CalendarCheck,
}

interface AchievementToastProps {
  achievement: {
    id: string
    name: string
    description: string
    icon: string
    points: number
  }
  show: boolean
  onClose: () => void
  duration?: number
}

/**
 * Toast notification for newly unlocked achievements.
 * Displays with animation and auto-dismisses after duration.
 */
export function AchievementToast({
  achievement,
  show,
  onClose,
  duration = 5000,
}: AchievementToastProps) {
  const [isVisible, setIsVisible] = useState(false)

  const IconComponent = iconMap[achievement.icon] ?? Trophy

  useEffect(() => {
    if (show) {
      // Delay for enter animation
      const showTimer = setTimeout(() => setIsVisible(true), 50)

      // Auto-dismiss
      const hideTimer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(onClose, 300) // Wait for exit animation
      }, duration)

      return () => {
        clearTimeout(showTimer)
        clearTimeout(hideTimer)
      }
    } else {
      setIsVisible(false)
    }
  }, [show, duration, onClose])

  if (!show) return null

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 z-50 max-w-sm transition-all duration-300 ease-out',
        isVisible
          ? 'translate-y-0 opacity-100'
          : 'translate-y-4 opacity-0'
      )}
    >
      <div className="relative overflow-hidden rounded-lg border bg-background shadow-lg">
        {/* Celebration gradient bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 animate-pulse" />

        <div className="flex items-start gap-4 p-4 pt-5">
          {/* Achievement Icon */}
          <div className="flex-shrink-0 flex items-center justify-center h-14 w-14 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg animate-bounce">
            <IconComponent className="h-7 w-7 text-white" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              <Trophy className="h-3 w-3" />
              Achievement Unlocked!
            </div>
            <h4 className="font-semibold text-foreground mt-1">
              {achievement.name}
            </h4>
            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
              {achievement.description}
            </p>
            <div className="mt-2">
              <PointsDisplay
                points={achievement.points}
                size="sm"
                showLabel
                animated
              />
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={() => {
              setIsVisible(false)
              setTimeout(onClose, 300)
            }}
            className="flex-shrink-0 p-1 rounded-md hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground" />
            <span className="sr-only">Dismiss</span>
          </button>
        </div>
      </div>
    </div>
  )
}

interface AchievementToastContainerProps {
  achievements: Array<{
    id: string
    name: string
    description: string
    icon: string
    points: number
  }>
  onDismiss: (id: string) => void
}

/**
 * Container for managing multiple achievement toasts.
 * Shows one achievement at a time in sequence.
 */
export function AchievementToastContainer({
  achievements,
  onDismiss,
}: AchievementToastContainerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const currentAchievement = achievements[currentIndex]

  const handleClose = () => {
    if (currentAchievement) {
      onDismiss(currentAchievement.id)
    }

    if (currentIndex < achievements.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    }
  }

  if (!currentAchievement) return null

  return (
    <AchievementToast
      key={currentAchievement.id}
      achievement={currentAchievement}
      show={true}
      onClose={handleClose}
    />
  )
}
