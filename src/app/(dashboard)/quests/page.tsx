'use client'

import { useState } from 'react'
import { QuestList } from '@/components/quests/quest-list'
import { QuestFilters } from '@/components/quests/quest-filters'
import { QuestSearch } from '@/components/quests/quest-search'
import { DifficultyFilter } from '@/components/quests/difficulty-filter'
import { useQuests } from '@/lib/hooks/use-quests'
import { useCategories } from '@/lib/hooks/use-categories'
import { useDebounce } from '@/lib/hooks/use-debounce'
import { useUserActiveQuestIds } from '@/lib/hooks/use-user-active-quest-ids'
import type { QuestDifficulty } from '@/lib/types/quest'

export default function QuestsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedDifficulty, setSelectedDifficulty] = useState<QuestDifficulty | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearch = useDebounce(searchQuery, 300)

  const { data: categories = [], isLoading: categoriesLoading } = useCategories({ onlyWithQuests: true })
  const { data: quests, isLoading: questsLoading, error } = useQuests({
    category_id: selectedCategory ?? undefined,
    search: debouncedSearch || undefined,
    difficulty: selectedDifficulty ?? undefined,
  })
  const { data: activeQuestIds } = useUserActiveQuestIds()

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
          <DifficultyFilter
            selectedDifficulty={selectedDifficulty}
            onDifficultyChange={setSelectedDifficulty}
          />
        </div>
      )}

      {error ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            Failed to load quests. Please try again later.
          </p>
        </div>
      ) : (
        <QuestList quests={quests || []} isLoading={questsLoading} activeQuestIds={activeQuestIds} />
      )}
    </div>
  )
}
