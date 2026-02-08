'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import type { TierInfo } from '@/lib/types/engagement'
import { TIER_COLOR_STYLES } from '@/lib/types/engagement'
import { getTierIcon } from '@/lib/utils/tier-icons'

interface SkillTierDisplayProps {
  tierInfo: TierInfo
  showProgress?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function SkillTierDisplay({
  tierInfo,
  showProgress = true,
  size = 'md',
  className,
}: SkillTierDisplayProps) {
  const { tier, points, nextTier, pointsToNext, progressPercent } = tierInfo

  const Icon = getTierIcon(tier.icon)
  const colorStyles = TIER_COLOR_STYLES[tier.color] || TIER_COLOR_STYLES.green

  const sizeClasses = {
    sm: {
      icon: 'h-6 w-6',
      name: 'text-base',
      points: 'text-sm',
    },
    md: {
      icon: 'h-8 w-8',
      name: 'text-lg',
      points: 'text-sm',
    },
    lg: {
      icon: 'h-12 w-12',
      name: 'text-2xl',
      points: 'text-base',
    },
  }

  const sizes = sizeClasses[size]

  return (
    <Card className={cn(colorStyles.bg, colorStyles.border, 'border', className)}>
      <CardContent className="pt-4">
        <div className="flex items-center gap-4">
          <div className={cn('rounded-full p-3', colorStyles.bg)}>
            <Icon className={cn(sizes.icon, colorStyles.text)} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between">
              <h3 className={cn('font-bold', colorStyles.text, sizes.name)}>
                {tier.name}
              </h3>
              <span className={cn('font-medium', colorStyles.text, sizes.points)}>
                {points.toLocaleString()} pts
              </span>
            </div>

            {showProgress && nextTier && (
              <div className="mt-2 space-y-1">
                <Progress
                  value={progressPercent}
                  className="h-2 bg-white/50"
                />
                <p className="text-xs text-muted-foreground">
                  {pointsToNext.toLocaleString()} points to {nextTier.name}
                </p>
              </div>
            )}

            {showProgress && !nextTier && (
              <p className="mt-2 text-xs text-muted-foreground">
                Maximum tier achieved!
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
