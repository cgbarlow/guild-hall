'use client'

import { X, Info, CheckCircle, AlertTriangle, PartyPopper } from 'lucide-react'
import { cn } from '@/lib/utils'
import { linkifyText } from '@/lib/utils/linkify'
import { Button } from '@/components/ui/button'
import type { BannerWithStatus, BannerVariant } from '@/lib/types/banner'
import { BANNER_VARIANT_STYLES } from '@/lib/types/banner'

const VARIANT_ICONS: Record<BannerVariant, typeof Info> = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  celebration: PartyPopper,
}

export interface BannerItemProps {
  banner: BannerWithStatus
  onDismiss: (bannerId: string) => void
  dismissing?: boolean
}

export function BannerItem({ banner, onDismiss, dismissing }: BannerItemProps) {
  const styles = BANNER_VARIANT_STYLES[banner.variant]
  const Icon = VARIANT_ICONS[banner.variant]

  return (
    <div
      className={cn(
        'relative flex items-start gap-3 p-4 border rounded-lg',
        styles.bg,
        styles.border,
        banner.variant === 'celebration' && 'animate-in fade-in slide-in-from-top-2 duration-500'
      )}
      role="alert"
    >
      {/* Icon */}
      <div className={cn('flex-shrink-0 mt-0.5', styles.icon)}>
        <Icon className="h-5 w-5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {banner.title && (
          <h4 className={cn('font-semibold text-sm', styles.text)}>
            {banner.title}
          </h4>
        )}
        <p className={cn('text-sm', styles.text, banner.title && 'mt-1')}>
          {linkifyText(banner.message)}
        </p>
      </div>

      {/* Dismiss button */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'flex-shrink-0 h-6 w-6 -mt-1 -mr-1',
          styles.text,
          'hover:bg-black/5 dark:hover:bg-white/5'
        )}
        onClick={() => onDismiss(banner.id)}
        disabled={dismissing}
        aria-label="Dismiss banner"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}
