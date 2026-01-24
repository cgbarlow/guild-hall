import { cn } from '@/lib/utils'
import type { Category } from '@/lib/types/quest'
import { CategoryIcon } from './category-icon'

interface CategoryBadgeProps {
  category: Category
  showIcon?: boolean
  className?: string
}

export function CategoryBadge({ category, showIcon = true, className }: CategoryBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        className
      )}
      style={{
        backgroundColor: `${category.color}20`,
        color: category.color,
        borderColor: category.color,
      }}
    >
      {showIcon && <CategoryIcon icon={category.icon} className="h-3 w-3" />}
      {category.name}
    </span>
  )
}
