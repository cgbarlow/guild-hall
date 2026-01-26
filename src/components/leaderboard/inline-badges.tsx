'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { LeaderboardBadge } from '@/lib/hooks/use-leaderboard-badges'

interface InlineBadgesProps {
  badges: LeaderboardBadge[]
  maxDisplay?: number
  className?: string
}

/**
 * Inline badge display for leaderboard
 * Shows small quest badge images with title on hover
 * Displays up to maxDisplay badges with "+X" for remaining
 */
export function InlineBadges({
  badges,
  maxDisplay = 5,
  className,
}: InlineBadgesProps) {
  // Filter to only badges with images
  const badgesWithImages = badges.filter((b) => b.badge_url)

  if (badgesWithImages.length === 0) {
    return null
  }

  const displayedBadges = badgesWithImages.slice(0, maxDisplay)
  const remainingCount = Math.max(0, badgesWithImages.length - maxDisplay)

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {displayedBadges.map((badge) => (
        <div
          key={badge.id}
          className="relative h-5 w-5 flex-shrink-0 cursor-default"
          title={badge.name}
        >
          <Image
            src={badge.badge_url!}
            alt={badge.name}
            fill
            className="object-contain"
            sizes="20px"
          />
        </div>
      ))}
      {remainingCount > 0 && (
        <span
          className="ml-0.5 text-xs text-muted-foreground font-medium cursor-default"
          title={`${remainingCount} more badge${remainingCount !== 1 ? 's' : ''}`}
        >
          +{remainingCount}
        </span>
      )}
    </div>
  )
}
