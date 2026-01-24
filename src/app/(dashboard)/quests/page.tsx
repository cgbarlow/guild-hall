'use client'

import { useState } from 'react'
import { QuestList } from '@/components/quests/quest-list'
import { QuestFilters } from '@/components/quests/quest-filters'
import { useQuests } from '@/lib/hooks/use-quests'
import type { Category } from '@/lib/types/quest'

// Mock categories until we have a categories table/hook
const mockCategories: Category[] = [
  {
    id: 'cat-combat',
    name: 'Combat',
    description: 'Battle quests involving fighting enemies',
    icon: 'sword',
    color: '#dc2626',
    created_at: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'cat-exploration',
    name: 'Exploration',
    description: 'Quests involving discovering new places',
    icon: 'compass',
    color: '#2563eb',
    created_at: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'cat-gathering',
    name: 'Gathering',
    description: 'Quests involving collecting items',
    icon: 'backpack',
    color: '#16a34a',
    created_at: '2024-01-01T00:00:00.000Z',
  },
]

export default function QuestsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const { data: quests, isLoading, error } = useQuests(
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

      <QuestFilters
        categories={mockCategories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {error ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            Failed to load quests. Please try again later.
          </p>
        </div>
      ) : (
        <QuestList quests={quests || []} isLoading={isLoading} />
      )}
    </div>
  )
}
