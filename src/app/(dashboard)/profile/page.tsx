'use client'

import { useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Award, Sparkles } from 'lucide-react'
import { ProfileStats } from '@/components/profile/profile-stats'
import { ProfileForm } from '@/components/profile/profile-form'
import { ActivityFeed } from '@/components/activity/activity-feed'
import { AvatarUpload } from '@/components/profile/avatar-upload'
import { QuestBadgeShowcase } from '@/components/profile/quest-badge-showcase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useProfile } from '@/lib/hooks/use-profile'
import { useUserActivity } from '@/lib/hooks/use-user-activity'
import { useUserQuestBadges } from '@/lib/hooks/use-user-quest-badges'
import { cn } from '@/lib/utils'

function ProfileContent() {
  const searchParams = useSearchParams()
  const isNewBadge = searchParams.get('newBadge') === 'true'
  const badgeSectionRef = useRef<HTMLDivElement>(null)

  const { data: profile, isLoading, error } = useProfile()
  const { data: activities = [], isLoading: activitiesLoading } = useUserActivity({ limit: 10 })
  const { data: badges = [], isLoading: badgesLoading } = useUserQuestBadges(profile?.id)

  // Scroll to badge section and highlight when coming from badge claim
  useEffect(() => {
    if (isNewBadge && badgeSectionRef.current && badges.length > 0) {
      badgeSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [isNewBadge, badges.length])

  if (isLoading) return <div className="flex items-center justify-center min-h-[400px]"><div className="text-muted-foreground">Loading profile...</div></div>
  if (error) return <div className="flex items-center justify-center min-h-[400px]"><div className="text-destructive">Error loading profile: {error.message}</div></div>
  if (!profile) return <div className="flex items-center justify-center min-h-[400px]"><div className="text-muted-foreground">Please sign in to view your profile</div></div>

  return (
    <div className="space-y-8">
      <div className="flex items-start gap-6">
        <AvatarUpload
          currentAvatarUrl={profile.avatar_url}
          displayName={profile.display_name}
          compact
        />
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{profile.display_name || 'Unnamed User'}</h1>
          {profile.bio && <p className="text-muted-foreground mt-1">{profile.bio}</p>}
        </div>
      </div>
      <ProfileStats totalPoints={profile.total_points ?? 0} questsCompleted={profile.quests_completed ?? 0} />

      {/* Quest Badges Section */}
      <Card
        ref={badgeSectionRef}
        className={cn(
          'transition-all duration-500',
          isNewBadge && 'ring-2 ring-purple-500 ring-offset-2 animate-pulse'
        )}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-500" />
            Quest Badges
            {isNewBadge && (
              <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                <Sparkles className="h-3 w-3" />
                New!
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {badgesLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading badges...</div>
          ) : (
            <QuestBadgeShowcase badges={badges} size="md" />
          )}
        </CardContent>
      </Card>

      <ProfileForm initialData={{ display_name: profile.display_name, bio: profile.bio, avatar_url: profile.avatar_url }} />

      {/* Activity Feed (FR9.5) */}
      <ActivityFeed
        activities={activities}
        isLoading={activitiesLoading}
        title="Recent Activity"
        emptyMessage="No activity yet. Start a quest to see your progress here!"
        limit={10}
      />
    </div>
  )
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><div className="text-muted-foreground">Loading profile...</div></div>}>
      <ProfileContent />
    </Suspense>
  )
}
