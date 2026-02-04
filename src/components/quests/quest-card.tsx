import Link from 'next/link'
import Image from 'next/image'
import { Clock, Award, Play, CheckCircle2, Hourglass, CircleDot, Lock, Star } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { QuestStatusBadge } from './quest-status-badge'
import { CategoryBadge } from './category-badge'
import { DifficultyBadge } from './difficulty-badge'
import type { Quest, QuestStatus, QuestDifficulty, Category, QuestPrerequisite } from '@/lib/types/quest'
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
  is_exclusive?: boolean
  is_side_quest?: boolean
}

interface QuestCardProps {
  quest: Quest | QuestCardData
  className?: string
  /** If provided, shows "Active" badge and links to my-quests instead */
  userQuestId?: string
  /** User's quest status - shows status tag on the card */
  userQuestStatus?: UserQuestStatus
  /** If true, quest is locked due to unmet prerequisites */
  isLocked?: boolean
  /** Incomplete prerequisites (for showing "Complete X first" message) */
  incompletePrerequisites?: QuestPrerequisite[]
}

/**
 * Get display info for user quest status
 * Returns null for statuses that shouldn't be displayed to users (e.g., abandoned)
 */
function getUserQuestStatusDisplay(status: UserQuestStatus): {
  label: string
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
  className: string
  icon: React.ReactNode
} | null {
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
    case 'abandoned':
    case 'expired':
      // Don't show internal statuses to users
      return null
  }
}

/**
 * Extract the first paragraph from a description
 */
function getFirstParagraph(text: string): string {
  // Split by double newline (paragraph break) or single newline
  const paragraphBreak = text.indexOf('\n\n')
  const lineBreak = text.indexOf('\n')

  if (paragraphBreak > 0) {
    return text.substring(0, paragraphBreak).trim()
  }
  if (lineBreak > 0) {
    return text.substring(0, lineBreak).trim()
  }
  return text.trim()
}

export function QuestCard({ quest, className, userQuestId, userQuestStatus, isLocked, incompletePrerequisites }: QuestCardProps) {
  // Use short_description if available, otherwise show first paragraph of description
  const displayDescription =
    quest.short_description ||
    (quest.description ? getFirstParagraph(quest.description) : 'No description available')

  // Map published status to open for display
  const displayStatus = (quest.status === 'published' ? 'open' : quest.status) as QuestStatus

  // If user is actively taking this quest, link to their quest progress page
  const href = userQuestId ? `/my-quests/${userQuestId}` : `/quests/${quest.id}`

  // Build lock message from incomplete prerequisites
  const lockMessage = incompletePrerequisites && incompletePrerequisites.length > 0
    ? `Complete first: ${incompletePrerequisites.map(p => p.prerequisite_title).join(', ')}`
    : 'Complete prerequisites first'

  return (
    <Link href={href} className="block">
      <Card
        className={cn(
          'h-full transition-all hover:shadow-md hover:border-primary/50',
          userQuestId && 'border-primary/30 bg-primary/5',
          isLocked && 'opacity-75 border-muted',
          className
        )}
      >
        <CardHeader className="pb-3">
          {/* Row 1: Title and badge image */}
          <div className="flex gap-4 items-start mb-2">
            <CardTitle className="flex-1 text-lg leading-tight">{quest.title}</CardTitle>
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
          {/* Row 2: Tags and status badges */}
          <div className="flex items-center gap-2 flex-wrap">
            {quest.category && <CategoryBadge category={quest.category} />}
            {/* Show Side Quest badge instead of difficulty for side quests */}
            {'is_side_quest' in quest && quest.is_side_quest ? (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-700">
                <Star className="h-3 w-3 mr-1 fill-amber-500 text-amber-500" />
                Side Quest
              </Badge>
            ) : (
              quest.difficulty && <DifficultyBadge difficulty={quest.difficulty} />
            )}
            {userQuestId && !userQuestStatus && (
              <Badge variant="default" className="bg-green-600 hover:bg-green-600">
                <Play className="h-3 w-3 mr-1" />
                Active
              </Badge>
            )}
            {userQuestStatus && getUserQuestStatusDisplay(userQuestStatus) && (
              <Badge
                variant={getUserQuestStatusDisplay(userQuestStatus)!.variant}
                className={getUserQuestStatusDisplay(userQuestStatus)!.className}
              >
                {getUserQuestStatusDisplay(userQuestStatus)!.icon}
                {getUserQuestStatusDisplay(userQuestStatus)!.label}
              </Badge>
            )}
            {isLocked && (
              <Badge variant="outline" className="text-muted-foreground border-muted-foreground/50">
                <Lock className="h-3 w-3 mr-1" />
                Locked
              </Badge>
            )}
            {!userQuestId && !userQuestStatus && !isLocked && (
              <QuestStatusBadge
                status={displayStatus}
                isExclusive={'is_exclusive' in quest ? quest.is_exclusive : false}
              />
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            {/* Left column: description and stats */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground mb-4 line-clamp-4">
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
              {isLocked && (
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  {lockMessage}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
