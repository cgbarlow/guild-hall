'use client'

import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PointsDisplayProps {
  points: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  animated?: boolean
  className?: string
}

/**
 * Points display component showing user's current points with an icon.
 * Supports different sizes and optional animation on point increase.
 */
export function PointsDisplay({
  points,
  size = 'md',
  showLabel = false,
  animated = false,
  className,
}: PointsDisplayProps) {
  const sizeClasses = {
    sm: 'text-sm gap-1',
    md: 'text-base gap-1.5',
    lg: 'text-lg gap-2',
  }

  const iconSizes = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }

  return (
    <div
      className={cn(
        'inline-flex items-center font-medium',
        sizeClasses[size],
        animated && 'transition-all duration-300',
        className
      )}
    >
      <Star
        className={cn(
          'text-amber-500 fill-amber-500',
          iconSizes[size],
          animated && 'animate-pulse'
        )}
      />
      <span className={cn(animated && 'animate-bounce')}>
        {points.toLocaleString()}
      </span>
      {showLabel && (
        <span className="text-muted-foreground ml-0.5">
          {points === 1 ? 'point' : 'points'}
        </span>
      )}
    </div>
  )
}

interface PointsBadgeProps {
  points: number
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outline' | 'gradient'
  className?: string
}

/**
 * Points badge component for displaying points in a contained badge format.
 * Uses different visual styles based on the variant prop.
 */
export function PointsBadge({
  points,
  size = 'md',
  variant = 'default',
  className,
}: PointsBadgeProps) {
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

  const variantClasses = {
    default: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    outline: 'border border-amber-500 text-amber-600 dark:text-amber-400',
    gradient: 'bg-gradient-to-r from-amber-400 to-orange-500 text-white',
  }

  return (
    <div
      className={cn(
        'inline-flex items-center font-semibold rounded-full',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    >
      <Star className={cn('fill-current', iconSizes[size])} />
      <span>{points.toLocaleString()}</span>
    </div>
  )
}

interface PointsDeltaProps {
  delta: number
  size?: 'sm' | 'md' | 'lg'
  showSign?: boolean
  className?: string
}

/**
 * Component for displaying point changes (gains or losses).
 * Shows positive changes in green and negative in red.
 */
export function PointsDelta({
  delta,
  size = 'md',
  showSign = true,
  className,
}: PointsDeltaProps) {
  const isPositive = delta > 0
  const isNegative = delta < 0

  const sizeClasses = {
    sm: 'text-xs gap-0.5',
    md: 'text-sm gap-1',
    lg: 'text-base gap-1',
  }

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4',
  }

  if (delta === 0) {
    return null
  }

  return (
    <div
      className={cn(
        'inline-flex items-center font-medium',
        sizeClasses[size],
        isPositive && 'text-green-600 dark:text-green-400',
        isNegative && 'text-red-600 dark:text-red-400',
        className
      )}
    >
      <Star className={cn('fill-current', iconSizes[size])} />
      <span>
        {showSign && isPositive && '+'}
        {delta.toLocaleString()}
      </span>
    </div>
  )
}
