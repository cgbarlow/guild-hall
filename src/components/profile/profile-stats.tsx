'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ProfileStatsProps { totalPoints: number; questsCompleted: number }

export function ProfileStats({ totalPoints, questsCompleted }: ProfileStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Points</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{totalPoints.toLocaleString()}</div></CardContent></Card>
      <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Quests Completed</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{questsCompleted.toLocaleString()}</div></CardContent></Card>
    </div>
  )
}
