'use client'

import { useRouter } from 'next/navigation'
import { Trophy, Star, TrendingUp } from 'lucide-react'
import { useLeaderboard, useUserRank } from '@/lib/hooks/use-leaderboard'
import { useGlobalActivity } from '@/lib/hooks/use-global-activity'
import { LeaderboardTable } from '@/components/leaderboard/leaderboard-table'
import { UserRank } from '@/components/leaderboard/user-rank'
import { ActivityFeed } from '@/components/activity/activity-feed'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export default function LeaderboardPage() {
  const router = useRouter()
  const { data: leaderboard, isLoading: isLoadingLeaderboard } = useLeaderboard()
  const { data: userRank, isLoading: isLoadingRank } = useUserRank()
  const { data: globalActivity = [], isLoading: isLoadingActivity } = useGlobalActivity({ limit: 10 })
  const [currentUserId, setCurrentUserId] = useState<string | undefined>()

  // Get current user ID
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id)
    })
  }, [])

  const handleRowClick = (entry: { id: string }) => {
    router.push(`/users/${entry.id}`)
  }

  // Calculate stats
  const totalPoints = leaderboard?.reduce((sum, e) => sum + e.points, 0) || 0
  const totalQuests = leaderboard?.reduce((sum, e) => sum + e.quests_completed, 0) || 0

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Trophy className="h-8 w-8 text-amber-500" />
          Leaderboard
        </h1>
        <p className="text-muted-foreground mt-1">
          See how you rank among fellow adventurers
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* User's Rank */}
        <UserRank
          rank={userRank?.rank || null}
          total={userRank?.total || 0}
          isLoading={isLoadingRank}
        />

        {/* Community Stats */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Star className="h-4 w-4" />
              Community Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {totalPoints.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total points earned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Quests Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {totalQuests.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              By all adventurers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout for Rankings and Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Leaderboard Table (2 columns) */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Rankings</h2>
          <LeaderboardTable
            entries={leaderboard || []}
            currentUserId={currentUserId}
            isLoading={isLoadingLeaderboard}
            onRowClick={handleRowClick}
          />
        </div>

        {/* Global Activity Feed (FR10.4) */}
        <div>
          <ActivityFeed
            activities={globalActivity}
            isLoading={isLoadingActivity}
            showUser={true}
            title="Recent Activity"
            emptyMessage="No recent community activity"
            limit={10}
          />
        </div>
      </div>

      {/* Privacy Note */}
      <p className="text-center text-xs text-muted-foreground">
        Only adventurers who have enabled leaderboard visibility appear here.
        <br />
        Update your privacy settings to show or hide your rank.
      </p>
    </div>
  )
}
