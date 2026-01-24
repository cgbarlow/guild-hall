'use client'

import { cn } from '@/lib/utils'
import type { Category } from '@/lib/types/quest'
import { CategoryIcon } from './category-icon'

interface QuestFiltersProps {
  categories: Category[]
  selectedCategory: string | null
  onCategoryChange: (categoryId: string | null) => void
  className?: string
}

// Default color for categories without a color
const DEFAULT_COLOR = '#6366f1'

export function QuestFilters({
  categories,
  selectedCategory,
  onCategoryChange,
  className,
}: QuestFiltersProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      <button
        onClick={() => onCategoryChange(null)}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors',
          selectedCategory === null
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
        )}
      >
        All Quests
      </button>
      {categories.map((category) => {
        const color = category.color || DEFAULT_COLOR
        return (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors',
              selectedCategory === category.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            )}
            style={
              selectedCategory === category.id
                ? { backgroundColor: color, color: 'white' }
                : undefined
            }
          >
            {category.icon && <CategoryIcon icon={category.icon} className="h-4 w-4" />}
            {category.name}
          </button>
        )
      })}
    </div>
  )
}
