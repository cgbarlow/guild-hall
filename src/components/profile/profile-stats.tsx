'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TIER_COLOR_STYLES } from '@/lib/types/engagement'
import { getTierIcon } from '@/lib/utils/tier-icons'

interface ProfileStatsProps {
  totalPoints: number
  questsCompleted: number
  tierName?: string | null
  tierIcon?: string | null
  tierColor?: string | null
}

export function ProfileStats({ totalPoints, questsCompleted, tierName, tierIcon, tierColor }: ProfileStatsProps) {
  // Get tier icon and color styling
  const TierIcon = getTierIcon(tierIcon ?? 'Swords')
  const colorKey = tierColor ?? 'green'
  const tierColorStyles = TIER_COLOR_STYLES[colorKey] ?? TIER_COLOR_STYLES.green

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Skill Tier</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <span className={tierColorStyles.text}>
              <TierIcon className="h-6 w-6" />
            </span>
            <span className="text-2xl font-bold">
              {tierName || 'Apprentice'}
            </span>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Points</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalPoints.toLocaleString()}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Quests Completed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{questsCompleted.toLocaleString()}</div>
        </CardContent>
      </Card>
    </div>
  )
}
