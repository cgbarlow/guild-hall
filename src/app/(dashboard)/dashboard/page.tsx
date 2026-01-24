import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata = {
  title: 'Dashboard | Guild Hall',
  description: 'Your Guild Hall dashboard',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch user profile - handle cases where profile may not exist yet
  let displayName = user?.email || 'User'
  let points = 0

  if (user?.id) {
    const { data: profile } = await supabase
      .from('users')
      .select('display_name, points')
      .eq('id', user.id)
      .single()

    if (profile) {
      displayName = (profile as { display_name?: string; points?: number }).display_name || displayName
      points = (profile as { display_name?: string; points?: number }).points || 0
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {displayName}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Points</CardTitle>
            <CardDescription>Your total earned points</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{points}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Quests</CardTitle>
            <CardDescription>Quests in progress</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">0</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Completed</CardTitle>
            <CardDescription>Quests completed</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">0</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Quests</CardTitle>
          <CardDescription>Browse and accept new quests</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No quests available yet. Check back soon!
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
