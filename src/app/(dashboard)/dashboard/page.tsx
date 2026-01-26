import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FeaturedQuests } from '@/components/dashboard/featured-quests'

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
  let activeQuestsCount = 0
  let completedQuestsCount = 0

  if (user?.id) {
    const { data: profile } = await supabase
      .from('users')
      .select('display_name, total_points')
      .eq('id', user.id)
      .single()

    if (profile) {
      displayName = (profile as { display_name?: string; total_points?: number }).display_name || displayName
      points = (profile as { display_name?: string; total_points?: number }).total_points || 0
    }

    // Fetch user quests for stats
    const { data: userQuests } = await supabase
      .from('user_quests')
      .select('id, status')
      .eq('user_id', user.id)

    if (userQuests) {
      const quests = userQuests as { id: string; status: string }[]
      activeQuestsCount = quests.filter(q => ['accepted', 'in_progress'].includes(q.status)).length
      completedQuestsCount = quests.filter(q => q.status === 'completed').length
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

        <Link href="/my-quests">
          <Card className="transition-colors hover:bg-muted/50 cursor-pointer">
            <CardHeader>
              <CardTitle>Active Quests</CardTitle>
              <CardDescription>Quests in progress</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{activeQuestsCount}</p>
            </CardContent>
          </Card>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Completed</CardTitle>
            <CardDescription>Quests completed</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{completedQuestsCount}</p>
          </CardContent>
        </Card>
      </div>

      <FeaturedQuests />
    </div>
  )
}
