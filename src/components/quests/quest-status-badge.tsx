import { Lock, KeyRound } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { QuestStatus } from '@/lib/types/quest'
import { getStatusLabel } from '@/lib/types/quest'

interface QuestStatusBadgeProps {
  status: QuestStatus
  isExclusive?: boolean
  isLocked?: boolean
  className?: string
}

const statusStyles: Record<QuestStatus | 'exclusive' | 'locked', string> = {
  draft: 'bg-gray-100 text-gray-700 border-gray-300',
  published: 'bg-green-100 text-green-700 border-green-300',
  archived: 'bg-slate-100 text-slate-700 border-slate-300',
  open: 'bg-green-100 text-green-700 border-green-300',
  locked: 'bg-gray-100 text-gray-500 border-gray-300',
  exclusive: 'bg-amber-100 text-amber-700 border-amber-300',
  in_progress: 'bg-blue-100 text-blue-700 border-blue-300',
  completed: 'bg-purple-100 text-purple-700 border-purple-300',
  claimed: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  submitted: 'bg-orange-100 text-orange-700 border-orange-300',
  approved: 'bg-purple-100 text-purple-700 border-purple-300',
  rejected: 'bg-red-100 text-red-700 border-red-300',
}

export function QuestStatusBadge({ status, isExclusive, isLocked, className }: QuestStatusBadgeProps) {
  // Map internal status to user-friendly display
  const displayStatus = status === 'published' ? 'open' : status
  const isOpenOrPublished = displayStatus === 'open' || status === 'published'

  // Determine the main status badge
  const mainStatus = isLocked && isOpenOrPublished ? 'locked' : displayStatus
  const mainLabel = mainStatus === 'locked' ? 'Locked' : (mainStatus === 'open' ? 'Open' : getStatusLabel(mainStatus))
  const mainStyleKey = mainStatus

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      {/* Main status badge (Open/Locked/etc) */}
      <span
        data-testid="quest-status-badge"
        className={cn(
          'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold',
          statusStyles[mainStyleKey] || statusStyles.open
        )}
      >
        {mainStatus === 'locked' && <Lock className="h-3 w-3" />}
        {mainLabel}
      </span>

      {/* Exclusive badge (additional, shown alongside status) */}
      {isExclusive && isOpenOrPublished && (
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold',
            statusStyles.exclusive
          )}
        >
          <KeyRound className="h-3 w-3" />
          Exclusive
        </span>
      )}
    </div>
  )
}
