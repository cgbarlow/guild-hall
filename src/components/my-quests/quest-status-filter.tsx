'use client'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Database } from '@/lib/types/database'

type UserQuestStatus = Database['public']['Tables']['user_quests']['Row']['status']

interface QuestStatusFilterProps {
  value: UserQuestStatus | 'all'
  onChange: (value: UserQuestStatus | 'all') => void
  counts?: {
    all: number
    in_progress: number
    completed: number
    accepted: number
  }
}

const statusOptions: { value: UserQuestStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'completed', label: 'Completed' },
]

export function QuestStatusFilter({
  value,
  onChange,
  counts,
}: QuestStatusFilterProps) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as UserQuestStatus | 'all')}>
      <TabsList>
        {statusOptions.map((option) => (
          <TabsTrigger key={option.value} value={option.value}>
            {option.label}
            {counts && (
              <span className="ml-1.5 text-xs text-muted-foreground">
                ({counts[option.value as keyof typeof counts] ?? 0})
              </span>
            )}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
