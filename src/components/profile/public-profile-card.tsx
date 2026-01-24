'use client'

import Image from 'next/image'
import { User, Trophy, ScrollText, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BadgeShowcase } from '@/components/profile/badge-showcase'
import { cn } from '@/lib/utils'
import type { PublicProfile } from '@/lib/types/public-profile'

interface AvatarProps {
  url: string | null
  name: string
  size?: 'sm' | 'md' | 'lg'
}

/**
 * Avatar component with fallback to initials
 */
function Avatar({ url, name, size = 'md' }: AvatarProps) {
  const sizeClasses = {
    sm: 'h-12 w-12 text-lg',
    md: 'h-20 w-20 text-2xl',
    lg: 'h-28 w-28 text-3xl',
  }

  const sizePx = {
    sm: 48,
    md: 80,
    lg: 112,
  }

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  if (url) {
    return (
      <Image
        src={url}
        alt={`${name}'s avatar`}
        width={sizePx[size]}
        height={sizePx[size]}
        className={cn(
          'rounded-full object-cover ring-2 ring-border',
          sizeClasses[size]
        )}
      />
    )
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60 font-semibold text-primary-foreground ring-2 ring-border',
        sizeClasses[size]
      )}
    >
      {initials || <User className="h-1/2 w-1/2" />}
    </div>
  )
}

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
}

/**
 * Small stat display component
 */
function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-lg bg-muted/50 p-3">
      <div className="text-muted-foreground">{icon}</div>
      <span className="text-xl font-bold">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}

interface PublicProfileCardProps {
  profile: PublicProfile
  className?: string
}

/**
 * Public profile display card
 * Shows user avatar, name, bio, stats, and achievements (if allowed)
 */
export function PublicProfileCard({ profile, className }: PublicProfileCardProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      {/* Header with gradient background */}
      <div className="h-24 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20" />

      <CardHeader className="-mt-12 flex flex-col items-center pb-4">
        <Avatar url={profile.avatar_url} name={profile.display_name} size="lg" />
        <CardTitle className="mt-4 text-2xl">{profile.display_name}</CardTitle>
        {profile.bio && (
          <CardDescription className="mt-2 max-w-md text-center">
            {profile.bio}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <StatCard
            icon={<Trophy className="h-5 w-5" />}
            label="Points"
            value={profile.total_points.toLocaleString()}
          />
          <StatCard
            icon={<ScrollText className="h-5 w-5" />}
            label="Quests"
            value={profile.quests_completed}
          />
          {profile.leaderboard_position !== undefined && (
            <StatCard
              icon={<TrendingUp className="h-5 w-5" />}
              label="Rank"
              value={`#${profile.leaderboard_position}`}
            />
          )}
        </div>

        {/* Achievements Section */}
        {profile.achievements.length > 0 && (
          <div className="space-y-3 pt-4 border-t">
            <h3 className="flex items-center gap-2 font-semibold">
              <Trophy className="h-5 w-5 text-amber-500" />
              Achievements
            </h3>
            <BadgeShowcase
              achievements={profile.achievements}
              size="sm"
              maxDisplay={10}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export { Avatar, StatCard }
