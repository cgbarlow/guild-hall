import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata = {
  title: 'GM Dashboard | Guild Hall',
  description: 'Game Master dashboard for managing quests and users',
}

export default function GMDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">GM Dashboard</h1>
        <p className="text-muted-foreground">
          Manage quests, review submissions, and coordinate guild activities.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Pending Reviews</CardTitle>
            <CardDescription>Evidence awaiting review</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">0</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Quests</CardTitle>
            <CardDescription>Published quests</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">0</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Extension Requests</CardTitle>
            <CardDescription>Pending extension requests</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">0</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest quest submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              No recent activity.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common GM tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm">• Create new quest</p>
            <p className="text-sm">• Review submissions</p>
            <p className="text-sm">• Manage users</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
