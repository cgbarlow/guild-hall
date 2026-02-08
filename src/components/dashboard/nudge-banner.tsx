'use client'

import Link from 'next/link'
import { X, ArrowRight, Clock, PartyPopper, Lightbulb, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { NudgeBannerData, NudgePriority } from '@/lib/types/engagement'

const PRIORITY_STYLES: Record<NudgePriority, {
  bg: string
  border: string
  text: string
  icon: React.ComponentType<{ className?: string }>
}> = {
  approved_ready: {
    bg: 'bg-blue-50 dark:bg-blue-950/20',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-800 dark:text-blue-200',
    icon: ArrowRight,
  },
  deadline_soon: {
    bg: 'bg-amber-50 dark:bg-amber-950/20',
    border: 'border-amber-200 dark:border-amber-800',
    text: 'text-amber-800 dark:text-amber-200',
    icon: Clock,
  },
  celebration: {
    bg: 'bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 dark:from-amber-950/30 dark:via-yellow-950/30 dark:to-amber-950/30',
    border: 'border-amber-300 dark:border-amber-700',
    text: 'text-amber-900 dark:text-amber-100',
    icon: PartyPopper,
  },
  quest_recommendation: {
    bg: 'bg-green-50 dark:bg-green-950/20',
    border: 'border-green-200 dark:border-green-800',
    text: 'text-green-800 dark:text-green-200',
    icon: Lightbulb,
  },
  badge_ready_to_claim: {
    bg: 'bg-gradient-to-r from-purple-50 via-fuchsia-50 to-purple-50 dark:from-purple-950/30 dark:via-fuchsia-950/30 dark:to-purple-950/30',
    border: 'border-purple-300 dark:border-purple-700',
    text: 'text-purple-900 dark:text-purple-100',
    icon: Award,
  },
}

interface NudgeBannerProps {
  nudge: NudgeBannerData
  onDismiss: () => void
  className?: string
}

export function NudgeBanner({ nudge, onDismiss, className }: NudgeBannerProps) {
  const styles = PRIORITY_STYLES[nudge.priority]
  const Icon = styles.icon

  return (
    <div
      className={cn(
        'relative flex items-center gap-4 p-4 rounded-lg border',
        styles.bg,
        styles.border,
        className
      )}
      role="alert"
    >
      <Icon className={cn('h-5 w-5 flex-shrink-0', styles.text)} />

      <div className="flex-1 min-w-0">
        <p className={cn('font-medium', styles.text)}>
          {nudge.message}
        </p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <Button size="sm" variant="secondary" asChild>
          <Link href={nudge.actionUrl}>
            {nudge.actionLabel}
          </Link>
        </Button>

        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0"
          onClick={onDismiss}
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
