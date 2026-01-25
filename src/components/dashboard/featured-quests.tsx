'use client'

import Link from 'next/link'
import { ChevronRight, Sparkles } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { QuestList } from '@/components/quests/quest-list'
import { useFeaturedQuests } from '@/lib/hooks/use-featured-quests'
import { useUserActiveQuestIds } from '@/lib/hooks/use-user-active-quest-ids'

export function FeaturedQuests() {
  const { data: quests, isLoading } = useFeaturedQuests()
  const { data: activeQuestIds } = useUserActiveQuestIds()

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Featured Quests
          </CardTitle>
          <CardDescription>Hand-picked adventures to get you started</CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/quests">
            View All <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {!isLoading && (!quests || quests.length === 0) ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              No featured quests available yet.
            </p>
            <Button variant="outline" asChild>
              <Link href="/quests">
                Browse All Quests
              </Link>
            </Button>
          </div>
        ) : (
          <QuestList
            quests={quests || []}
            isLoading={isLoading}
            activeQuestIds={activeQuestIds}
          />
        )}
      </CardContent>
    </Card>
  )
}
