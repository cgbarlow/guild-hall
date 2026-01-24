'use client'

import { useState } from 'react'
import { ClipboardCheck, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SubmissionList } from '@/components/gm/review/submission-list'
import { ReviewFilters } from '@/components/gm/review/review-filters'
import { usePendingSubmissions } from '@/lib/hooks/use-pending-submissions'

export default function ReviewQueuePage() {
  const [questFilter, setQuestFilter] = useState<string | undefined>(undefined)

  const {
    data: submissions,
    isLoading,
    error,
    refetch,
    isFetching
  } = usePendingSubmissions({ questId: questFilter })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ClipboardCheck className="h-8 w-8" />
            Review Queue
          </h1>
          <p className="text-muted-foreground">
            Review and approve evidence submissions from users.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <ReviewFilters
        questId={questFilter}
        onQuestChange={setQuestFilter}
      />

      {error ? (
        <div className="text-center py-12">
          <p className="text-destructive">Failed to load submissions. Please try again.</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => refetch()}
          >
            Retry
          </Button>
        </div>
      ) : (
        <>
          {!isLoading && submissions && submissions.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {submissions.length} submission{submissions.length !== 1 ? 's' : ''} pending review
            </p>
          )}
          <SubmissionList
            submissions={submissions || []}
            isLoading={isLoading}
            emptyMessage="No pending submissions to review. Check back later!"
          />
        </>
      )}
    </div>
  )
}
