'use client'

import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number
  max?: number
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ProgressBar({
  value,
  max = 100,
  showLabel = true,
  size = 'md',
  className,
}: ProgressBarProps) {
  const percentage = max > 0 ? Math.round((value / max) * 100) : 0

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Progress
        value={percentage}
        className={cn('flex-1', sizeClasses[size])}
      />
      {showLabel && (
        <span className="text-sm text-muted-foreground min-w-[3rem] text-right">
          {percentage}%
        </span>
      )}
    </div>
  )
}
