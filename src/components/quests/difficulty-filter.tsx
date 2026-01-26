'use client'

import { cn } from '@/lib/utils'
import type { QuestDifficulty } from '@/lib/types/quest'
import { Swords } from 'lucide-react'
import { getDifficultyLevels } from './difficulty-badge'

interface DifficultyFilterProps {
  selectedDifficulty: QuestDifficulty | null
  onDifficultyChange: (difficulty: QuestDifficulty | null) => void
  className?: string
}

// Difficulty colors for buttons
const DIFFICULTY_COLORS: Record<QuestDifficulty, string> = {
  'Apprentice': '#22c55e',
  'Journeyman': '#3b82f6',
  'Expert': '#f59e0b',
  'Master': '#ef4444',
}

export function DifficultyFilter({
  selectedDifficulty,
  onDifficultyChange,
  className,
}: DifficultyFilterProps) {
  const difficulties = getDifficultyLevels()

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      <button
        onClick={() => onDifficultyChange(null)}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors',
          selectedDifficulty === null
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
        )}
      >
        <Swords className="h-4 w-4" />
        All Levels
      </button>
      {difficulties.map((difficulty) => {
        const color = DIFFICULTY_COLORS[difficulty]
        return (
          <button
            key={difficulty}
            onClick={() => onDifficultyChange(difficulty)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors',
              selectedDifficulty === difficulty
                ? 'text-white'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            )}
            style={
              selectedDifficulty === difficulty
                ? { backgroundColor: color }
                : undefined
            }
          >
            {difficulty}
          </button>
        )
      })}
    </div>
  )
}
