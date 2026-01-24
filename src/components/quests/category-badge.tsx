import { cn } from '@/lib/utils'
import type { Category } from '@/lib/types/quest'
import { CategoryIcon } from './category-icon'

interface CategoryBadgeProps {
  category: Category
  showIcon?: boolean
  className?: string
}

// Default color for categories without a color
const DEFAULT_COLOR = '#6366f1'

export function CategoryBadge({ category, showIcon = true, className }: CategoryBadgeProps) {
  const color = category.color || DEFAULT_COLOR

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        className
      )}
      style={{
        backgroundColor: `${color}20`,
        color: color,
        borderColor: color,
      }}
    >
      {showIcon && category.icon && <CategoryIcon icon={category.icon} className="h-3 w-3" />}
      {category.name}
    </span>
  )
}
