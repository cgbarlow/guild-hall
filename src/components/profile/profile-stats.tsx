'use client'

import { Sprout, TreeDeciduous, Trees, Mountain, Crown, Trophy, Star, Swords } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TIER_COLOR_STYLES } from '@/lib/types/engagement'

/**
 * Map tier icon names to Lucide icons
 */
function getTierIcon(iconName: string, className?: string) {
  const icons: Record<string, React.ReactNode> = {
    sprout: <Sprout className={className} />,
    treedeciduous: <TreeDeciduous className={className} />,
    trees: <Trees className={className} />,
    mountain: <Mountain className={className} />,
    crown: <Crown className={className} />,
    trophy: <Trophy className={className} />,
    star: <Star className={className} />,
    swords: <Swords className={className} />,
  }
  return icons[iconName.toLowerCase()] || <Swords className={className} />
}

interface ProfileStatsProps {
  totalPoints: number
  questsCompleted: number
  tierName?: string | null
  tierIcon?: string | null
  tierColor?: string | null
}

export function ProfileStats({ totalPoints, questsCompleted, tierName, tierIcon, tierColor }: ProfileStatsProps) {
  // Get tier color styling
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
              {getTierIcon(tierIcon ?? 'Sprout', 'h-6 w-6')}
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
