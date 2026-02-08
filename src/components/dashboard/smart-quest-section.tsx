'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ChevronRight, PlayCircle, Sparkles } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { QuestList } from '@/components/quests/quest-list'
import { useFeaturedQuests } from '@/lib/hooks/use-featured-quests'
import { useQuests } from '@/lib/hooks/use-quests'
import { useUserActiveQuestIds, useUserAllQuestIds, useUserQuestStatuses } from '@/lib/hooks/use-user-active-quest-ids'
import { useAllQuestPrerequisites } from '@/lib/hooks/use-all-quest-prerequisites'
import { getDifficultyOrder } from '@/lib/types/quest'

interface SmartQuestSectionProps {
  activeQuests: Array<{
    id: string
    quest_id: string
    quests: {
      id: string
      title: string
      description: string
      points: number
      category_id: string | null
    }
  }>
  isLoading?: boolean
}

const MIN_FEATURED_QUESTS = 3

export function SmartQuestSection({ activeQuests, isLoading }: SmartQuestSectionProps) {
  const [tab, setTab] = useState<'continue' | 'featured'>(
    activeQuests.length > 0 ? 'continue' : 'featured'
  )

  const { data: featuredQuests, isLoading: loadingFeatured } = useFeaturedQuests()
  const { data: allQuests, isLoading: loadingAllQuests } = useQuests()
  const { data: activeQuestIds } = useUserActiveQuestIds()
  const { data: allUserQuestIds } = useUserAllQuestIds()
  const { data: userQuestStatuses } = useUserQuestStatuses()

  const hasActiveQuests = activeQuests.length > 0

  // Get all potential quest IDs (featured + all published) for prerequisites check
  const allPotentialQuestIds = useMemo(() => {
    const featuredIds = (featuredQuests ?? []).map(q => q.id)
    const allIds = (allQuests ?? []).filter(q => q.status === 'published').map(q => q.id)
    return [...new Set([...featuredIds, ...allIds])]
  }, [featuredQuests, allQuests])

  // Fetch prerequisites for all potential quests upfront
  const { data: questLockStatuses } = useAllQuestPrerequisites(allPotentialQuestIds)

  // Filter out quests the user has already started or completed (excluding abandoned)
  // Also filter out locked quests when filling to minimum count
  const availableFeaturedQuests = useMemo(() => {
    const featured = featuredQuests?.filter(
      quest => !allUserQuestIds?.has(quest.id)
    ) ?? []

    // If we have enough featured quests, return them (locked ones will show with lock badge)
    if (featured.length >= MIN_FEATURED_QUESTS) {
      return featured
    }

    // Fill with additional open quests that are NOT locked (sorted by difficulty - easiest first)
    // Never include side quests unless they explicitly have featured flag (already in `featured` list)
    const featuredIds = new Set(featured.map(q => q.id))
    const additionalQuests = (allQuests ?? [])
      .filter(quest => {
        const lockStatus = questLockStatuses?.get(quest.id)
        return (
          !allUserQuestIds?.has(quest.id) && // Not already taken
          !featuredIds.has(quest.id) && // Not already in featured
          quest.status === 'published' && // Only published quests
          !lockStatus?.isLocked && // Only unlocked quests for fill slots
          !quest.is_side_quest // Never auto-fill with side quests
        )
      })
      .sort((a, b) => getDifficultyOrder(a.difficulty) - getDifficultyOrder(b.difficulty)) // Easiest first
      .slice(0, MIN_FEATURED_QUESTS - featured.length)

    // Sort final list: easiest quests first (fill quests should come before harder featured quests)
    return [...featured, ...additionalQuests].sort(
      (a, b) => getDifficultyOrder(a.difficulty) - getDifficultyOrder(b.difficulty)
    )
  }, [featuredQuests, allQuests, allUserQuestIds, questLockStatuses])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Featured Quests</CardTitle>
          <CardDescription>
            {hasActiveQuests
              ? 'Continue your journey or discover new adventures'
              : 'Discover adventures that await you'}
          </CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/quests">
            View All <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {hasActiveQuests ? (
          <Tabs value={tab} onValueChange={(v) => setTab(v as 'continue' | 'featured')}>
            <TabsList className="mb-4">
              <TabsTrigger value="continue" className="gap-1">
                <PlayCircle className="h-4 w-4" />
                Continue ({activeQuests.length})
              </TabsTrigger>
              <TabsTrigger value="featured" className="gap-1">
                <Sparkles className="h-4 w-4" />
                Featured
              </TabsTrigger>
            </TabsList>

            <TabsContent value="continue">
              {activeQuests.length > 0 ? (
                <div className="space-y-4">
                  {activeQuests.map(userQuest => (
                    <Link
                      key={userQuest.id}
                      href={`/my-quests/${userQuest.id}`}
                      className="block p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="font-medium">{userQuest.quests.title}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                            {userQuest.quests.description}
                          </p>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {userQuest.quests.points} pts
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No active quests. Start a new adventure!
                </p>
              )}
            </TabsContent>

            <TabsContent value="featured">
              {loadingFeatured || loadingAllQuests ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading featured quests...</p>
                </div>
              ) : availableFeaturedQuests.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No new featured quests available.</p>
                </div>
              ) : (
                <QuestList
                  quests={availableFeaturedQuests}
                  isLoading={false}
                  activeQuestIds={activeQuestIds}
                  userQuestStatuses={userQuestStatuses}
                  questLockStatuses={questLockStatuses}
                />
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <>
            {loadingFeatured || loadingAllQuests ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading featured quests...</p>
              </div>
            ) : availableFeaturedQuests.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  {allUserQuestIds && allUserQuestIds.size > 0
                    ? "You've completed all available quests!"
                    : 'No quests available yet.'}
                </p>
                <Button variant="outline" asChild>
                  <Link href="/quests">
                    Browse All Quests
                  </Link>
                </Button>
              </div>
            ) : (
              <QuestList
                quests={availableFeaturedQuests}
                isLoading={false}
                activeQuestIds={activeQuestIds}
                userQuestStatuses={userQuestStatuses}
                questLockStatuses={questLockStatuses}
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
