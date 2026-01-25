'use client'

import { ProfileAvatar } from '@/components/profile/profile-avatar'
import { ProfileStats } from '@/components/profile/profile-stats'
import { ProfileForm } from '@/components/profile/profile-form'
import { ActivityFeed } from '@/components/activity/activity-feed'
import { useProfile } from '@/lib/hooks/use-profile'
import { useUserActivity } from '@/lib/hooks/use-user-activity'

export default function ProfilePage() {
  const { data: profile, isLoading, error } = useProfile()
  const { data: activities = [], isLoading: activitiesLoading } = useUserActivity({ limit: 10 })

  if (isLoading) return <div className="flex items-center justify-center min-h-[400px]"><div className="text-muted-foreground">Loading profile...</div></div>
  if (error) return <div className="flex items-center justify-center min-h-[400px]"><div className="text-destructive">Error loading profile: {error.message}</div></div>
  if (!profile) return <div className="flex items-center justify-center min-h-[400px]"><div className="text-muted-foreground">Please sign in to view your profile</div></div>

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-6">
        <ProfileAvatar avatarUrl={profile.avatar_url} displayName={profile.display_name} size="lg" />
        <div>
          <h1 className="text-2xl font-bold">{profile.display_name || 'Unnamed User'}</h1>
          {profile.bio && <p className="text-muted-foreground mt-1">{profile.bio}</p>}
        </div>
      </div>
      <ProfileStats totalPoints={profile.total_points ?? 0} questsCompleted={profile.quests_completed ?? 0} />

      {/* Activity Feed (FR9.5) */}
      <ActivityFeed
        activities={activities}
        isLoading={activitiesLoading}
        title="Recent Activity"
        emptyMessage="No activity yet. Start a quest to see your progress here!"
        limit={10}
      />

      <ProfileForm initialData={{ display_name: profile.display_name, bio: profile.bio, avatar_url: profile.avatar_url }} />
    </div>
  )
}
