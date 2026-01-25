'use client'

import { useState } from 'react'
import { ClipboardCheck, RefreshCw, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SubmissionList } from '@/components/gm/review/submission-list'
import { ReviewFilters } from '@/components/gm/review/review-filters'
import { QuestApprovalCard } from '@/components/gm/quest-approval-card'
import { usePendingSubmissions } from '@/lib/hooks/use-pending-submissions'
import { usePendingQuestApprovals } from '@/lib/hooks/use-quest-approvals'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function ReviewQueuePage() {
  const [questFilter, setQuestFilter] = useState<string | undefined>(undefined)

  const {
    data: submissions,
    isLoading,
    error,
    refetch,
    isFetching
  } = usePendingSubmissions({ questId: questFilter })

  const {
    data: questApprovals,
    isLoading: approvalsLoading,
    refetch: refetchApprovals,
  } = usePendingQuestApprovals()

  const submissionCount = submissions?.length || 0
  const approvalCount = questApprovals?.length || 0

  const handleRefresh = () => {
    refetch()
    refetchApprovals()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ClipboardCheck className="h-8 w-8" />
            Review Queue
          </h1>
          <p className="text-muted-foreground">
            Review evidence submissions and quest completions from users.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isFetching}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="submissions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="submissions" className="gap-2">
            <ClipboardCheck className="h-4 w-4" />
            Objective Submissions
            {submissionCount > 0 && (
              <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-primary text-primary-foreground">
                {submissionCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="approvals" className="gap-2">
            <Trophy className="h-4 w-4" />
            Quest Approvals
            {approvalCount > 0 && (
              <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-amber-500 text-white">
                {approvalCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="submissions" className="space-y-4">
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
        </TabsContent>

        <TabsContent value="approvals" className="space-y-4">
          {approvalsLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-32 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : questApprovals && questApprovals.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground">
                {questApprovals.length} quest{questApprovals.length !== 1 ? 's' : ''} awaiting final approval
              </p>
              <div className="space-y-4">
                {questApprovals.map((approval) => (
                  <QuestApprovalCard
                    key={approval.id}
                    approval={approval}
                    onReviewed={() => refetchApprovals()}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No quests awaiting final approval. Check back later!
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
