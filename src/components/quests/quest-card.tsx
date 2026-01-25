import Link from 'next/link'
import { Clock, Award, Play } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { QuestStatusBadge } from './quest-status-badge'
import { CategoryBadge } from './category-badge'
import type { Quest, QuestStatus } from '@/lib/types/quest'
import { cn } from '@/lib/utils'

interface QuestCardProps {
  quest: Quest
  className?: string
  /** If provided, shows "Active" badge and links to my-quests instead */
  userQuestId?: string
}

export function QuestCard({ quest, className, userQuestId }: QuestCardProps) {
  // Use short_description if available, otherwise truncate description
  const displayDescription =
    quest.short_description ||
    (quest.description ? `${quest.description.substring(0, 100)}${quest.description.length > 100 ? '...' : ''}` : 'No description available')

  // Map published status to open for display
  const displayStatus: QuestStatus = quest.status === 'published' ? 'open' : quest.status

  // If user is actively taking this quest, link to their quest progress page
  const href = userQuestId ? `/my-quests/${userQuestId}` : `/quests/${quest.id}`

  return (
    <Link href={href} className="block">
      <Card
        className={cn(
          'h-full transition-all hover:shadow-md hover:border-primary/50',
          userQuestId && 'border-primary/30 bg-primary/5',
          className
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                {quest.category && <CategoryBadge category={quest.category} />}
                {userQuestId && (
                  <Badge variant="default" className="bg-green-600 hover:bg-green-600">
                    <Play className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                )}
              </div>
              <CardTitle className="text-lg leading-tight">{quest.title}</CardTitle>
            </div>
            {!userQuestId && <QuestStatusBadge status={displayStatus} />}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {displayDescription}
          </p>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-amber-600">
              <Award className="h-4 w-4" />
              <span className="font-medium">{quest.points} pts</span>
            </div>
            {quest.time_limit_days && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{quest.time_limit_days} days</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
