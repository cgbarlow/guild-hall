'use client'

import { useState } from 'react'
import { QuestList } from '@/components/quests/quest-list'
import { QuestFilters } from '@/components/quests/quest-filters'
import { useQuests } from '@/lib/hooks/use-quests'
import { useCategories } from '@/lib/hooks/use-categories'

export default function QuestsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const { data: categories = [], isLoading: categoriesLoading } = useCategories()
  const { data: quests, isLoading: questsLoading, error } = useQuests(
    selectedCategory ? { category_id: selectedCategory } : undefined
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bounty Board</h1>
        <p className="text-muted-foreground">
          Browse available quests and embark on new adventures
        </p>
      </div>

      {!categoriesLoading && (
        <QuestFilters
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
      )}

      {error ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            Failed to load quests. Please try again later.
          </p>
        </div>
      ) : (
        <QuestList quests={quests || []} isLoading={questsLoading} />
      )}
    </div>
  )
}
