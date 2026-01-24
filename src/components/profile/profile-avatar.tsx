'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'

interface ProfileAvatarProps {
  avatarUrl?: string | null
  displayName?: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-16 h-16 text-xl',
  lg: 'w-24 h-24 text-3xl',
}

const sizePx = {
  sm: 32,
  md: 64,
  lg: 96,
}

export function ProfileAvatar({ avatarUrl, displayName, size = 'md', className }: ProfileAvatarProps) {
  const initials = displayName ? displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) : '?'

  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt={displayName || 'Profile avatar'}
        width={sizePx[size]}
        height={sizePx[size]}
        className={cn('rounded-full object-cover', sizeClasses[size], className)}
      />
    )
  }

  return <div className={cn('rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold', sizeClasses[size], className)}>{initials}</div>
}
