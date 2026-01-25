'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Scroll, ClipboardCheck, Clock, Plus, FileText, Users } from 'lucide-react'
import { useGMQuests, useGMQuestCounts } from '@/lib/hooks/use-gm-quests'
import { usePendingSubmissions } from '@/lib/hooks/use-pending-submissions'
import { useExtensionRequests } from '@/lib/hooks/use-extension-requests'
import { useNotifications } from '@/lib/hooks/use-notifications'
import { useActiveQuestCount } from '@/lib/hooks/use-active-quest-count'

export default function GMDashboardPage() {
  const { data: questCounts, isLoading: questsLoading } = useGMQuestCounts()
  const { data: draftQuests, isLoading: draftsLoading } = useGMQuests({ status: 'draft' })
  const { data: submissions, isLoading: submissionsLoading } = usePendingSubmissions()
  const { data: extensions, isLoading: extensionsLoading } = useExtensionRequests()
  const { data: notifications, isLoading: notificationsLoading } = useNotifications({ limit: 5 })
  const { data: activeQuestCount, isLoading: activeLoading } = useActiveQuestCount()

  const pendingReviews = submissions?.length ?? 0
  // Extension requests are already filtered to pending by the hook (extension_granted is null)
  const pendingExtensions = extensions?.length ?? 0
  const recentActivity = notifications?.slice(0, 5) ?? []

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">GM Dashboard</h1>
          <p className="text-muted-foreground">
            Manage quests, review submissions, and coordinate guild activities.
          </p>
        </div>
        <Button asChild>
          <Link href="/gm/quests/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Quest
          </Link>
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/gm/review">
          <Card className="transition-colors hover:border-primary/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
              <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {submissionsLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <div className="text-2xl font-bold">{pendingReviews}</div>
              )}
              <p className="text-xs text-muted-foreground">
                Evidence awaiting review
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/gm/quests">
          <Card className="transition-colors hover:border-primary/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quest Stats</CardTitle>
              <Scroll className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {questsLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <div className="text-2xl font-bold">{questCounts?.published ?? 0}</div>
              )}
              <p className="text-xs text-muted-foreground">
                Published quests
              </p>
            </CardContent>
          </Card>
        </Link>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Adventurers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {activeLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <div className="text-2xl font-bold">{activeQuestCount ?? 0}</div>
            )}
            <p className="text-xs text-muted-foreground">
              People on quests
            </p>
          </CardContent>
        </Card>

        <Link href="/gm/extensions">
          <Card className="transition-colors hover:border-primary/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Extension Requests</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {extensionsLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <div className="text-2xl font-bold">{pendingExtensions}</div>
              )}
              <p className="text-xs text-muted-foreground">
                Pending extension requests
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest quest submissions and updates</CardDescription>
          </CardHeader>
          <CardContent>
            {notificationsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-3/4 mb-1" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No recent activity.
              </p>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((notification) => (
                  <div key={notification.id} className="flex items-start gap-3 text-sm">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Scroll className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{notification.title}</p>
                      <p className="text-muted-foreground text-xs">{notification.message}</p>
                      <p className="text-muted-foreground text-xs mt-1">
                        {new Date(notification.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common GM tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/gm/quests/new">
                <Plus className="mr-2 h-4 w-4" />
                Create new quest
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/gm/review">
                <ClipboardCheck className="mr-2 h-4 w-4" />
                Review submissions
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/gm/extensions">
                <Clock className="mr-2 h-4 w-4" />
                Manage extensions
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Draft Quests */}
      <Card>
        <CardHeader>
          <CardTitle>Draft Quests</CardTitle>
          <CardDescription>Unpublished quests ready for review</CardDescription>
        </CardHeader>
        <CardContent>
          {draftsLoading ? (
            <div className="space-y-3">
              {[1, 2].map(i => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : !draftQuests || draftQuests.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No draft quests. <Link href="/gm/quests/new" className="text-primary hover:underline">Create one?</Link>
            </p>
          ) : (
            <div className="space-y-3">
              {draftQuests.map((quest) => (
                <Link
                  key={quest.id}
                  href={`/gm/quests/${quest.id}`}
                  className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{quest.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {quest.points} points
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
