'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Award } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { QuestBadge } from '@/lib/types/public-profile'

interface QuestBadgeProps {
  badge: QuestBadge
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
}

/**
 * Individual quest badge component displaying a badge image
 */
function QuestBadgeItem({ badge, size = 'md', onClick }: QuestBadgeProps) {
  const sizeClasses = {
    sm: 'h-16 w-16',
    md: 'h-20 w-20',
    lg: 'h-24 w-24',
  }

  return (
    <div
      className={cn(
        'group flex flex-col items-center gap-2',
        onClick && 'cursor-pointer'
      )}
      onClick={onClick}
    >
      <div
        className={cn(
          'relative flex-shrink-0 transition-transform group-hover:scale-110',
          sizeClasses[size]
        )}
        title={badge.quest_title}
      >
        <Image
          src={badge.badge_url}
          alt={badge.quest_title}
          fill
          className="object-contain"
          sizes="96px"
        />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-foreground line-clamp-2">{badge.quest_title}</p>
        <p className="text-xs text-muted-foreground">{badge.formatted_date}</p>
      </div>
    </div>
  )
}

interface QuestBadgeShowcaseProps {
  badges: QuestBadge[]
  size?: 'sm' | 'md' | 'lg'
  maxDisplay?: number
  className?: string
}

/**
 * Grid display of quest badges
 * Shows badges in a responsive grid layout
 * Clicking a badge opens a modal with details
 */
export function QuestBadgeShowcase({
  badges,
  size = 'md',
  maxDisplay,
  className,
}: QuestBadgeShowcaseProps) {
  const [selectedBadge, setSelectedBadge] = useState<QuestBadge | null>(null)

  const displayedBadges = maxDisplay
    ? badges.slice(0, maxDisplay)
    : badges

  const remainingCount = maxDisplay
    ? Math.max(0, badges.length - maxDisplay)
    : 0

  if (badges.length === 0) {
    return (
      <div className={cn('text-center py-8', className)}>
        <Award className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <p className="mt-2 text-sm text-muted-foreground">
          No quest badges yet
        </p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {displayedBadges.map((badge) => (
          <QuestBadgeItem
            key={badge.id}
            badge={badge}
            size={size}
            onClick={() => setSelectedBadge(badge)}
          />
        ))}
      </div>
      {remainingCount > 0 && (
        <p className="text-center text-sm text-muted-foreground">
          +{remainingCount} more badge{remainingCount !== 1 ? 's' : ''}
        </p>
      )}

      {/* Badge detail modal */}
      <Dialog open={!!selectedBadge} onOpenChange={() => setSelectedBadge(null)}>
        <DialogContent className="sm:max-w-md">
          {selectedBadge && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedBadge.quest_title}</DialogTitle>
                <DialogDescription>
                  Completed on {selectedBadge.formatted_date}
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-center py-6">
                <div className="relative h-32 w-32">
                  <Image
                    src={selectedBadge.badge_url}
                    alt={selectedBadge.quest_title}
                    fill
                    className="object-contain"
                    sizes="128px"
                  />
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export { QuestBadgeItem }
