'use client'

import { useGMQuests } from '@/lib/hooks/use-gm-quests'
import type { ReviewStatusFilter } from '@/lib/hooks/use-pending-submissions'
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
  statusFilter: ReviewStatusFilter
  onStatusChange: (status: ReviewStatusFilter) => void
}

export function ReviewFilters({
  questId,
  onQuestChange,
  statusFilter,
  onStatusChange,
}: ReviewFiltersProps) {
  const { data: quests, isLoading } = useGMQuests({ status: 'published' })

  const handleQuestChange = (value: string) => {
    onQuestChange(value === 'all' ? undefined : value)
  }

  const handleStatusChange = (value: string) => {
    onStatusChange(value as ReviewStatusFilter)
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
      <div className="flex items-center gap-2">
        <Label htmlFor="status-filter" className="text-sm font-medium whitespace-nowrap">
          Status:
        </Label>
        <Select
          value={statusFilter}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger id="status-filter" className="w-[140px]">
            <SelectValue placeholder="Pending" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Label htmlFor="quest-filter" className="text-sm font-medium whitespace-nowrap">
          Quest:
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
