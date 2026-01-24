import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Scroll, ClipboardCheck, Clock, Plus } from 'lucide-react'

export const metadata = {
  title: 'GM Dashboard | Guild Hall',
  description: 'Game Master dashboard for managing quests and users',
}

export default function GMDashboardPage() {
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
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/gm/review">
          <Card className="transition-colors hover:border-primary/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
              <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Evidence awaiting review
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/gm/quests">
          <Card className="transition-colors hover:border-primary/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Quests</CardTitle>
              <Scroll className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Published quests
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/gm/extensions">
          <Card className="transition-colors hover:border-primary/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Extension Requests</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
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
            <p className="text-sm text-muted-foreground py-8 text-center">
              No recent activity.
            </p>
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
          <p className="text-sm text-muted-foreground py-8 text-center">
            No draft quests. <Link href="/gm/quests/new" className="text-primary hover:underline">Create one?</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
