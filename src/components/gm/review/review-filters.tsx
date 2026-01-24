'use client'

import { useGMQuests } from '@/lib/hooks/use-gm-quests'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

interface ReviewFiltersProps {
  questId: string | undefined
  onQuestChange: (questId: string | undefined) => void
}

export function ReviewFilters({ questId, onQuestChange }: ReviewFiltersProps) {
  const { data: quests, isLoading } = useGMQuests({ status: 'published' })

  const handleQuestChange = (value: string) => {
    onQuestChange(value === 'all' ? undefined : value)
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
      <div className="flex items-center gap-2">
        <Label htmlFor="quest-filter" className="text-sm font-medium whitespace-nowrap">
          Filter by Quest:
        </Label>
        <Select
          value={questId || 'all'}
          onValueChange={handleQuestChange}
          disabled={isLoading}
        >
          <SelectTrigger id="quest-filter" className="w-[200px]">
            <SelectValue placeholder="All Quests" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Quests</SelectItem>
            {quests?.map((quest) => (
              <SelectItem key={quest.id} value={quest.id}>
                {quest.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
