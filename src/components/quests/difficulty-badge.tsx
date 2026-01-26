import { cn } from '@/lib/utils'
import type { QuestDifficulty } from '@/lib/types/quest'
import { Swords } from 'lucide-react'

interface DifficultyBadgeProps {
  difficulty: QuestDifficulty
  showIcon?: boolean
  className?: string
}

// Difficulty colors and styling
const DIFFICULTY_CONFIG: Record<QuestDifficulty, { color: string; bgColor: string }> = {
  'Apprentice': { color: '#22c55e', bgColor: '#22c55e20' },    // Green
  'Journeyman': { color: '#3b82f6', bgColor: '#3b82f620' },    // Blue
  'Expert': { color: '#f59e0b', bgColor: '#f59e0b20' },        // Amber
  'Master': { color: '#ef4444', bgColor: '#ef444420' },        // Red
}

export function DifficultyBadge({ difficulty, showIcon = true, className }: DifficultyBadgeProps) {
  const config = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG['Apprentice']

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        className
      )}
      style={{
        backgroundColor: config.bgColor,
        color: config.color,
      }}
    >
      {showIcon && <Swords className="h-3 w-3" />}
      {difficulty}
    </span>
  )
}

// Helper to get all difficulty levels in order
export function getDifficultyLevels(): QuestDifficulty[] {
  return ['Apprentice', 'Journeyman', 'Expert', 'Master']
}
