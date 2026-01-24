import Link from 'next/link'
import { Clock, Award } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { QuestStatusBadge } from './quest-status-badge'
import { CategoryBadge } from './category-badge'
import type { Quest, QuestStatus } from '@/lib/types/quest'
import { cn } from '@/lib/utils'

interface QuestCardProps {
  quest: Quest
  className?: string
}

export function QuestCard({ quest, className }: QuestCardProps) {
  // Use short_description if available, otherwise truncate description
  const displayDescription =
    quest.short_description ||
    (quest.description ? `${quest.description.substring(0, 100)}${quest.description.length > 100 ? '...' : ''}` : 'No description available')

  // Map published status to open for display
  const displayStatus: QuestStatus = quest.status === 'published' ? 'open' : quest.status

  return (
    <Link href={`/quests/${quest.id}`} className="block">
      <Card
        className={cn(
          'h-full transition-all hover:shadow-md hover:border-primary/50',
          className
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col gap-2">
              {quest.category && <CategoryBadge category={quest.category} />}
              <CardTitle className="text-lg leading-tight">{quest.title}</CardTitle>
            </div>
            <QuestStatusBadge status={displayStatus} />
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
