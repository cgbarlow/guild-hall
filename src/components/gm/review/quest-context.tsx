'use client'

import { Scroll, Target, Award, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface QuestContextProps {
  quest: {
    id: string
    title: string
    points: number
    description?: string | null
    completion_days?: number | null
  } | null
  objective: {
    id: string
    title: string
    description: string | null
    points: number
    evidence_type: 'none' | 'text' | 'link' | 'text_or_link' | null
    display_order?: number
  } | null
  totalObjectives?: number
  completedObjectives?: number
}

function getEvidenceTypeLabel(type: string | null): string {
  const labels: Record<string, string> = {
    none: 'No evidence required',
    text: 'Text evidence',
    link: 'Link evidence',
    text_or_link: 'Text or link evidence',
  }
  return labels[type || 'none'] || 'Unknown'
}

export function QuestContext({
  quest,
  objective,
  totalObjectives = 0,
  completedObjectives = 0,
}: QuestContextProps) {
  if (!quest) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Scroll className="h-5 w-5" />
            Quest Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Quest information not available.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Scroll className="h-5 w-5" />
          Quest Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quest Details */}
        <div>
          <h4 className="font-semibold mb-1">{quest.title}</h4>
          {quest.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {quest.description}
            </p>
          )}
          <div className="flex items-center gap-3 mt-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Award className="h-3 w-3" />
              {quest.points} pts
            </Badge>
            {quest.completion_days && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {quest.completion_days} days
              </Badge>
            )}
          </div>
        </div>

        {/* Progress */}
        {totalObjectives > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Quest Progress</span>
              <span className="font-medium">
                {completedObjectives} / {totalObjectives} objectives
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{
                  width: `${totalObjectives > 0 ? (completedObjectives / totalObjectives) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Current Objective */}
        {objective && (
          <div className="border-t pt-4">
            <h5 className="text-sm font-medium flex items-center gap-2 mb-2">
              <Target className="h-4 w-4" />
              Current Objective
            </h5>
            <div className="rounded-md bg-muted/50 p-3">
              <p className="font-medium text-sm">{objective.title}</p>
              {objective.description && (
                <p className="text-xs text-muted-foreground mt-1">
                  {objective.description}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  <Award className="h-3 w-3 mr-1" />
                  {objective.points} pts
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {getEvidenceTypeLabel(objective.evidence_type)}
                </Badge>
              </div>
            </div>
          </div>
        )}

        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link href={`/gm/quests/${quest.id}`}>
            View Quest Details
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
