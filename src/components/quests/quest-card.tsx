import Link from 'next/link'
import Image from 'next/image'
import { Clock, Award, Play, CheckCircle2, Hourglass, CircleDot } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { QuestStatusBadge } from './quest-status-badge'
import { CategoryBadge } from './category-badge'
import { DifficultyBadge } from './difficulty-badge'
import type { Quest, QuestStatus, QuestDifficulty, Category } from '@/lib/types/quest'
import { cn } from '@/lib/utils'

type UserQuestStatus = 'accepted' | 'in_progress' | 'ready_to_claim' | 'awaiting_final_approval' | 'completed' | 'abandoned' | 'expired'

/**
 * Minimal quest data required for card display
 */
interface QuestCardData {
  id: string
  title: string
  description: string | null
  short_description?: string | null
  status: string
  points: number
  time_limit_days?: number | null
  badge_url?: string | null
  category_id?: string | null
  category?: Category | null
  difficulty?: QuestDifficulty | null
}

interface QuestCardProps {
  quest: Quest | QuestCardData
  className?: string
  /** If provided, shows "Active" badge and links to my-quests instead */
  userQuestId?: string
  /** User's quest status - shows status tag on the card */
  userQuestStatus?: UserQuestStatus
}

/**
 * Get display info for user quest status
 */
function getUserQuestStatusDisplay(status: UserQuestStatus): {
  label: string
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
  className: string
  icon: React.ReactNode
} {
  switch (status) {
    case 'in_progress':
      return {
        label: 'In Progress',
        variant: 'default',
        className: 'bg-amber-500 hover:bg-amber-500',
        icon: <Hourglass className="h-3 w-3 mr-1" />,
      }
    case 'accepted':
      return {
        label: 'Accepted',
        variant: 'secondary',
        className: 'bg-blue-500 hover:bg-blue-500 text-white',
        icon: <CircleDot className="h-3 w-3 mr-1" />,
      }
    case 'completed':
      return {
        label: 'Completed',
        variant: 'default',
        className: 'bg-green-600 hover:bg-green-600',
        icon: <CheckCircle2 className="h-3 w-3 mr-1" />,
      }
    case 'ready_to_claim':
      return {
        label: 'Ready to Claim',
        variant: 'default',
        className: 'bg-green-500 hover:bg-green-500',
        icon: <CheckCircle2 className="h-3 w-3 mr-1" />,
      }
    case 'awaiting_final_approval':
      return {
        label: 'Awaiting Approval',
        variant: 'default',
        className: 'bg-purple-500 hover:bg-purple-500',
        icon: <Hourglass className="h-3 w-3 mr-1" />,
      }
    default:
      return {
        label: status.replace('_', ' '),
        variant: 'outline',
        className: '',
        icon: null,
      }
  }
}

export function QuestCard({ quest, className, userQuestId, userQuestStatus }: QuestCardProps) {
  // Use short_description if available, otherwise truncate description
  const displayDescription =
    quest.short_description ||
    (quest.description ? `${quest.description.substring(0, 100)}${quest.description.length > 100 ? '...' : ''}` : 'No description available')

  // Map published status to open for display
  const displayStatus = (quest.status === 'published' ? 'open' : quest.status) as QuestStatus

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
          <div className="flex gap-4">
            {/* Left column: title and badges */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {quest.category && <CategoryBadge category={quest.category} />}
                  {quest.difficulty && <DifficultyBadge difficulty={quest.difficulty} />}
                  {userQuestId && !userQuestStatus && (
                    <Badge variant="default" className="bg-green-600 hover:bg-green-600">
                      <Play className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  )}
                  {userQuestStatus && (
                    <Badge
                      variant={getUserQuestStatusDisplay(userQuestStatus).variant}
                      className={getUserQuestStatusDisplay(userQuestStatus).className}
                    >
                      {getUserQuestStatusDisplay(userQuestStatus).icon}
                      {getUserQuestStatusDisplay(userQuestStatus).label}
                    </Badge>
                  )}
                </div>
                {!userQuestId && !userQuestStatus && <QuestStatusBadge status={displayStatus} />}
              </div>
              <CardTitle className="text-lg leading-tight">{quest.title}</CardTitle>
            </div>
            {/* Right column: badge image */}
            {quest.badge_url && (
              <div className="flex-shrink-0">
                <div className="w-16 h-16 relative">
                  <Image
                    src={quest.badge_url}
                    alt="Quest badge"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            {/* Left column: description and stats */}
            <div className="flex-1 min-w-0">
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
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
