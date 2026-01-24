import { cn } from '@/lib/utils'
import type { QuestStatus } from '@/lib/types/quest'
import { getStatusLabel } from '@/lib/types/quest'

interface QuestStatusBadgeProps {
  status: QuestStatus
  className?: string
}

const statusStyles: Record<QuestStatus, string> = {
  draft: 'bg-gray-100 text-gray-700 border-gray-300',
  published: 'bg-green-100 text-green-700 border-green-300',
  open: 'bg-green-100 text-green-700 border-green-300',
  in_progress: 'bg-blue-100 text-blue-700 border-blue-300',
  completed: 'bg-purple-100 text-purple-700 border-purple-300',
  claimed: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  submitted: 'bg-orange-100 text-orange-700 border-orange-300',
  approved: 'bg-purple-100 text-purple-700 border-purple-300',
  rejected: 'bg-red-100 text-red-700 border-red-300',
}

export function QuestStatusBadge({ status, className }: QuestStatusBadgeProps) {
  // Map internal status to user-friendly display
  const displayStatus = status === 'published' ? 'open' : status
  const displayLabel = displayStatus === 'open' ? 'Open' : getStatusLabel(displayStatus)

  return (
    <span
      data-testid="quest-status-badge"
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        statusStyles[displayStatus] || statusStyles.open,
        className
      )}
    >
      {displayLabel}
    </span>
  )
}
