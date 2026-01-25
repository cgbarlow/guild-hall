'use client'

import Link from 'next/link'
import { Clock, Award, Edit, MoreVertical, Archive, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CategoryBadge } from '@/components/quests/category-badge'
import type { Quest, QuestDbStatus } from '@/lib/types/quest'
import { cn } from '@/lib/utils'

interface GMQuestCardProps {
  quest: Quest
  className?: string
  onArchive?: (questId: string) => void
  onDelete?: (questId: string) => void
}

function getStatusBadgeVariant(status: QuestDbStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'published':
      return 'default'
    case 'draft':
      return 'secondary'
    case 'archived':
      return 'outline'
    default:
      return 'secondary'
  }
}

function getStatusLabel(status: QuestDbStatus): string {
  switch (status) {
    case 'published':
      return 'Published'
    case 'draft':
      return 'Draft'
    case 'archived':
      return 'Archived'
    default:
      return status
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function GMQuestCard({ quest, className, onArchive, onDelete }: GMQuestCardProps) {
  const displayDescription =
    quest.short_description ||
    (quest.description
      ? `${quest.description.substring(0, 100)}${quest.description.length > 100 ? '...' : ''}`
      : 'No description available')

  const status = quest.status as QuestDbStatus

  return (
    <Link href={`/gm/quests/${quest.id}`} className="block">
    <Card className={cn('h-full transition-colors hover:bg-muted/50', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-2 flex-1 min-w-0">
            {quest.category && <CategoryBadge category={quest.category} />}
            <CardTitle className="text-lg leading-tight break-words">{quest.title}</CardTitle>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge variant={getStatusBadgeVariant(status)}>
              {getStatusLabel(status)}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/gm/quests/${quest.id}`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Quest
                  </Link>
                </DropdownMenuItem>
                {status !== 'archived' && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onArchive?.(quest.id)}
                      className="text-muted-foreground"
                    >
                      <Archive className="mr-2 h-4 w-4" />
                      Archive
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete?.(quest.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {displayDescription}
        </p>
        <div className="flex items-center justify-between">
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
          <div className="text-xs text-muted-foreground">
            {quest.published_at
              ? `Published ${formatDate(quest.published_at)}`
              : `Created ${formatDate(quest.created_at)}`}
          </div>
        </div>
      </CardContent>
    </Card>
    </Link>
  )
}
