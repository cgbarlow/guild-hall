'use client'

import { useState } from 'react'
import { Clock, Calendar, Check, X, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useReviewExtension, type ExtensionRequest } from '@/lib/hooks/use-extension-requests'

interface ExtensionCardProps {
  request: ExtensionRequest
}

export function ExtensionCard({ request }: ExtensionCardProps) {
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [newDeadline, setNewDeadline] = useState('')
  const { mutate: reviewExtension, isPending } = useReviewExtension()

  const formattedRequestDate = request.extension_requested_at
    ? new Date(request.extension_requested_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Unknown'

  const formattedDeadline = request.current_deadline
    ? new Date(request.current_deadline).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'No deadline'

  const handleApprove = () => {
    reviewExtension({
      userQuestId: request.user_quest_id,
      approved: true,
      newDeadline: newDeadline || undefined,
    })
    setShowApproveDialog(false)
  }

  const handleDeny = () => {
    reviewExtension({
      userQuestId: request.user_quest_id,
      approved: false,
    })
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                <User className="h-3 w-3" />
                {request.user_display_name || request.user_email}
              </div>
              <h3 className="font-semibold leading-tight">{request.quest_title}</h3>
            </div>
            <Badge variant="secondary">
              <Clock className="h-3 w-3 mr-1" />
              Pending
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pb-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <Calendar className="h-4 w-4" />
            <span>Current deadline: {formattedDeadline}</span>
          </div>

          {request.extension_reason && (
            <div className="bg-muted rounded-lg p-3">
              <p className="text-sm font-medium mb-1">Reason for extension:</p>
              <p className="text-sm text-muted-foreground">{request.extension_reason}</p>
            </div>
          )}

          <p className="text-xs text-muted-foreground mt-3">
            Requested on {formattedRequestDate}
          </p>
        </CardContent>

        <CardFooter className="gap-2 pt-3 border-t">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleDeny}
            disabled={isPending}
          >
            <X className="h-4 w-4 mr-1" />
            Deny
          </Button>
          <Button
            size="sm"
            className="flex-1"
            onClick={() => setShowApproveDialog(true)}
            disabled={isPending}
          >
            <Check className="h-4 w-4 mr-1" />
            Approve
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Extension</DialogTitle>
            <DialogDescription>
              Set a new deadline for {request.user_display_name || 'this user'}&apos;s quest.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-deadline">New Deadline</Label>
              <Input
                id="new-deadline"
                type="date"
                value={newDeadline}
                onChange={(e) => setNewDeadline(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to extend by the original time limit
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={isPending}>
              Approve Extension
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
