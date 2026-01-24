'use client'

import { Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DependencyIndicatorProps {
  isLocked: boolean
  dependencyTitle?: string
  className?: string
}

export function DependencyIndicator({
  isLocked,
  dependencyTitle,
  className,
}: DependencyIndicatorProps) {
  if (!isLocked) {
    return null
  }

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 text-xs text-muted-foreground',
        className
      )}
    >
      <Lock className="h-3 w-3" />
      <span>
        {dependencyTitle
          ? `Complete "${dependencyTitle}" first`
          : 'Complete previous objective first'}
      </span>
    </div>
  )
}
