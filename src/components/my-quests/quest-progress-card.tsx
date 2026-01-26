'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Clock, Award, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProgressBar } from './progress-bar'
import { getUserQuestStatusInfo, type UserQuestWithQuest } from '@/lib/hooks/use-user-quests'
import { cn } from '@/lib/utils'

interface QuestProgressCardProps {
  userQuest: UserQuestWithQuest
  className?: string
}

function getDaysRemaining(deadline: string | null): number | null {
  if (!deadline) return null
  const now = new Date()
  const deadlineDate = new Date(deadline)
  const diffTime = deadlineDate.getTime() - now.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export function QuestProgressCard({
  userQuest,
  className,
}: QuestProgressCardProps) {
  const statusInfo = getUserQuestStatusInfo(userQuest.status)
  const daysRemaining = getDaysRemaining(userQuest.deadline || userQuest.extended_deadline)
  const isOverdue = daysRemaining !== null && daysRemaining < 0
  const isUrgent = daysRemaining !== null && daysRemaining >= 0 && daysRemaining <= 3

  const progress = userQuest.objectivesCount
    ? Math.round(((userQuest.completedObjectivesCount || 0) / userQuest.objectivesCount) * 100)
    : 0

  return (
    <Link href={`/my-quests/${userQuest.id}`} className="block">
      <Card className={cn('hover:shadow-md hover:border-primary/50 transition-all cursor-pointer', className)}>
        <CardHeader className="pb-3">
          <div className="flex gap-4">
            {/* Left column: status and title */}
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                    statusInfo.color,
                    'text-white'
                  )}
                >
                  {statusInfo.label}
                </span>
                {userQuest.extension_requested && (
                  <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                    Extension Requested
                  </span>
                )}
              </div>
              <CardTitle className="text-lg">
                {userQuest.quest?.title || 'Untitled Quest'}
              </CardTitle>
            </div>
            {/* Right column: badge image */}
            {userQuest.quest?.badge_url && (
              <div className="flex-shrink-0">
                <div className="w-16 h-16 relative">
                  <Image
                    src={userQuest.quest.badge_url}
                    alt="Quest badge"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            )}
          </div>
        </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress */}
        {userQuest.status !== 'completed' && userQuest.objectivesCount && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span>
                {userQuest.completedObjectivesCount || 0} / {userQuest.objectivesCount} objectives
              </span>
            </div>
            <ProgressBar value={progress} />
          </div>
        )}

        {/* Stats */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <Award className="h-4 w-4 text-amber-500" />
            <span>{userQuest.quest?.points || 0} pts</span>
          </div>
          {(userQuest.deadline || userQuest.extended_deadline) && (
            <div
              className={cn(
                'flex items-center gap-1.5',
                isOverdue && 'text-destructive',
                isUrgent && !isOverdue && 'text-amber-500'
              )}
            >
              {isOverdue ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <Clock className="h-4 w-4" />
              )}
              <span>
                {isOverdue
                  ? `${Math.abs(daysRemaining!)} days overdue`
                  : daysRemaining === 0
                  ? 'Due today'
                  : `${daysRemaining} days left`}
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        {userQuest.quest?.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {userQuest.quest.description}
          </p>
        )}
      </CardContent>
      </Card>
    </Link>
  )
}
