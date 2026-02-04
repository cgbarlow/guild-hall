'use client'

import { useState, useMemo } from 'react'
import { QuestList } from '@/components/quests/quest-list'
import { SideQuestSection } from '@/components/quests/side-quest-section'
import { QuestFilters } from '@/components/quests/quest-filters'
import { QuestSearch } from '@/components/quests/quest-search'
import { DifficultyFilter } from '@/components/quests/difficulty-filter'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useQuests } from '@/lib/hooks/use-quests'
import { useCategories } from '@/lib/hooks/use-categories'
import { useDebounce } from '@/lib/hooks/use-debounce'
import { useUserActiveQuestIds, useUserQuestStatuses } from '@/lib/hooks/use-user-active-quest-ids'
import { useAllQuestPrerequisites } from '@/lib/hooks/use-all-quest-prerequisites'
import type { QuestDifficulty } from '@/lib/types/quest'

export default function QuestsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedDifficulty, setSelectedDifficulty] = useState<QuestDifficulty | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [hideCompleted, setHideCompleted] = useState(false)
  const debouncedSearch = useDebounce(searchQuery, 300)

  const { data: categories = [], isLoading: categoriesLoading } = useCategories({ onlyWithQuests: true })
  const { data: quests, isLoading: questsLoading, error } = useQuests({
    category_id: selectedCategory ?? undefined,
    search: debouncedSearch || undefined,
    difficulty: selectedDifficulty ?? undefined,
  })
  const { data: activeQuestIds } = useUserActiveQuestIds()
  const { data: userQuestStatuses } = useUserQuestStatuses()

  // Get quest IDs for prerequisite lookup
  const questIds = useMemo(() => quests?.map(q => q.id) || [], [quests])
  const { data: questLockStatuses } = useAllQuestPrerequisites(questIds)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bounty Board</h1>
        <p className="text-muted-foreground">
          Browse available quests and embark on new adventures
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <QuestSearch
          value={searchQuery}
          onChange={setSearchQuery}
          className="w-full sm:max-w-xs"
        />
      </div>

      {!categoriesLoading && (
        <div className="space-y-4">
          <QuestFilters
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
          <div className="flex flex-wrap items-center gap-4">
            <DifficultyFilter
              selectedDifficulty={selectedDifficulty}
              onDifficultyChange={setSelectedDifficulty}
            />
            <div className="flex items-center gap-2">
              <Switch
                id="hide-completed"
                checked={hideCompleted}
                onCheckedChange={setHideCompleted}
              />
              <Label htmlFor="hide-completed" className="text-sm cursor-pointer">
                Hide completed quests
              </Label>
            </div>
          </div>
        </div>
      )}

      {error ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            Failed to load quests. Please try again later.
          </p>
        </div>
      ) : (
        <>
          {/* Mobile: Side Quests above main quests */}
          <div className="lg:hidden">
            <SideQuestSection
              quests={quests || []}
              isLoading={questsLoading}
              activeQuestIds={activeQuestIds}
              userQuestStatuses={userQuestStatuses}
              questLockStatuses={questLockStatuses}
              hideCompleted={hideCompleted}
              className="mb-8"
            />
          </div>

          <div className="flex gap-8">
            {/* Main Quest List - filter out side quests */}
            <div className="flex-1 min-w-0">
              <QuestList
                quests={(quests || []).filter(q => !(q as any).is_side_quest)}
                isLoading={questsLoading}
                activeQuestIds={activeQuestIds}
                userQuestStatuses={userQuestStatuses}
                questLockStatuses={questLockStatuses}
                hideCompleted={hideCompleted}
                sortByLockedStatus={true}
              />
            </div>

            {/* Desktop: Side Quests on the right side */}
            <SideQuestSection
              quests={quests || []}
              isLoading={questsLoading}
              activeQuestIds={activeQuestIds}
              userQuestStatuses={userQuestStatuses}
              questLockStatuses={questLockStatuses}
              hideCompleted={hideCompleted}
              className="w-80 flex-shrink-0 hidden lg:block"
            />
          </div>
        </>
      )}
    </div>
  )
}
