'use client'

import { useMemo } from 'react'
import { Star } from 'lucide-react'
import { QuestCard } from './quest-card'
import type { Quest, QuestPrerequisite } from '@/lib/types/quest'
import { cn } from '@/lib/utils'

interface QuestLockStatus {
  isLocked: boolean
  incompletePrerequisites: QuestPrerequisite[]
}

interface SideQuestSectionProps {
  quests: Quest[]
  isLoading?: boolean
  className?: string
  /** Map of questId -> userQuestId for quests the user is actively taking */
  activeQuestIds?: Map<string, string>
  /** Map of questId -> {userQuestId, status} for all user quests */
  userQuestStatuses?: Map<string, { userQuestId: string; status: string }>
  /** Map of questId -> lock status with incomplete prerequisites */
  questLockStatuses?: Map<string, QuestLockStatus>
  /** Hide quests the user has completed */
  hideCompleted?: boolean
}

export function SideQuestSection({
  quests,
  isLoading,
  className,
  activeQuestIds,
  userQuestStatuses,
  questLockStatuses,
  hideCompleted = false,
}: SideQuestSectionProps) {
  // Filter to only side quests
  const sideQuests = useMemo(() => {
    if (!quests) return []

    // Filter to side quests only
    const filtered = quests.filter((quest) => (quest as any).is_side_quest === true)

    // Create status info for filtering
    return filtered
      .map((quest) => {
        const userQuest = userQuestStatuses?.get(quest.id)
        const isCompleted = userQuest?.status === 'completed'
        const lockStatus = questLockStatuses?.get(quest.id)
        const isLocked = lockStatus?.isLocked ?? false
        return { quest, userQuest, isCompleted, isLocked, lockStatus }
      })
      .filter((q) => !hideCompleted || !q.isCompleted)
  }, [quests, userQuestStatuses, questLockStatuses, hideCompleted])

  // Don't render section if loading or no side quests
  // This prevents the "flash" of the section heading before we know if there are any side quests
  if (isLoading || sideQuests.length === 0) {
    return null
  }

  return (
    <section className={cn('space-y-4', className)}>
      <div>
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
          <h2 className="text-xl font-semibold">Side Quests</h2>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Bonus opportunities to earn extra kudos
        </p>
      </div>

      <div className="space-y-4">
        {sideQuests.map(({ quest, userQuest, isLocked, lockStatus }) => (
          <div
            key={quest.id}
            className="rounded-lg border-2 border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50/50 to-transparent dark:from-amber-950/20"
          >
            <QuestCard
              quest={quest}
              userQuestId={userQuest?.userQuestId || activeQuestIds?.get(quest.id)}
              userQuestStatus={userQuest?.status as any}
              isLocked={isLocked}
              incompletePrerequisites={lockStatus?.incompletePrerequisites}
              className="border-0 bg-transparent"
            />
          </div>
        ))}
      </div>
    </section>
  )
}
