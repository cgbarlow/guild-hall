'use client'

import { ArrowLeft, Award, Clock, User, Calendar } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { QuestStatusBadge } from './quest-status-badge'
import { CategoryBadge } from './category-badge'
import { ObjectivesList } from './objectives-list'
import { AcceptQuestButton } from './accept-quest-button'
import type { QuestWithRelations } from '@/lib/types/quest'
import { cn } from '@/lib/utils'

interface QuestDetailProps {
  quest: QuestWithRelations
  onAccept?: (questId: string) => Promise<void>
  canAccept?: boolean
  className?: string
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function QuestDetail({
  quest,
  onAccept,
  canAccept = true,
  className,
}: QuestDetailProps) {
  const isOpen = quest.status === 'open'

  return (
    <div className={cn('space-y-6', className)}>
      {/* Back button */}
      <Button variant="ghost" asChild className="gap-2">
        <Link href="/quests">
          <ArrowLeft className="h-4 w-4" />
          Back to Bounty Board
        </Link>
      </Button>

      {/* Main quest card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              {quest.category && <CategoryBadge category={quest.category} />}
              <CardTitle className="text-2xl sm:text-3xl">{quest.title}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Posted on {formatDate(quest.created_at)}
              </CardDescription>
            </div>
            <QuestStatusBadge status={quest.status} className="self-start" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quest stats */}
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              <div>
                <p className="text-sm text-muted-foreground">Reward</p>
                <p className="text-lg font-semibold">{quest.points} pts</p>
              </div>
            </div>
            {quest.time_limit_days && (
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Time Limit</p>
                  <p className="text-lg font-semibold">{quest.time_limit_days} days</p>
                </div>
              </div>
            )}
            {quest.claimed_by && (
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Claimed by</p>
                  <p className="text-lg font-semibold">You</p>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {quest.description || 'No description provided.'}
            </p>
          </div>

          {/* Objectives */}
          {quest.objectives && quest.objectives.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Objectives</h3>
              <ObjectivesList objectives={quest.objectives} />
            </div>
          )}

          {/* Accept button */}
          {isOpen && canAccept && (
            <div className="pt-4 border-t">
              <AcceptQuestButton
                questId={quest.id}
                onAccept={onAccept}
                disabled={!onAccept}
              />
            </div>
          )}

          {/* Status message for non-open quests */}
          {!isOpen && (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                {quest.status === 'in_progress' && 'This quest is currently in progress.'}
                {quest.status === 'completed' && 'This quest has been completed.'}
                {quest.status === 'claimed' && 'This quest has been claimed.'}
                {quest.status === 'submitted' && 'This quest has been submitted for review.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
