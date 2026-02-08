'use client'

import { cn } from '@/lib/utils'
import { TIER_COLOR_STYLES } from '@/lib/types/engagement'
import { getTierIcon } from '@/lib/utils/tier-icons'
import type { LeaderboardTierInfo } from '@/lib/hooks/use-leaderboard'

interface TierBadgeProps {
  tier: LeaderboardTierInfo
  size?: 'sm' | 'md'
  showName?: boolean
  className?: string
}

export function TierBadge({ tier, size = 'sm', showName = false, className }: TierBadgeProps) {
  const Icon = getTierIcon(tier.icon)
  const colorStyles = TIER_COLOR_STYLES[tier.color] || TIER_COLOR_STYLES.green

  const sizeClasses = {
    sm: {
      wrapper: 'h-6 w-6',
      icon: 'h-3.5 w-3.5',
    },
    md: {
      wrapper: 'h-8 w-8',
      icon: 'h-4 w-4',
    },
  }

  const sizes = sizeClasses[size]

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <div
        className={cn(
          'rounded-full flex items-center justify-center',
          sizes.wrapper,
          colorStyles.bg
        )}
        title={tier.name}
      >
        <Icon className={cn(sizes.icon, colorStyles.text)} />
      </div>
      {showName && (
        <span className={cn('text-xs font-medium', colorStyles.text)}>
          {tier.name}
        </span>
      )}
    </div>
  )
}
