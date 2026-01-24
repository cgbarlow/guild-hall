'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useRequestExtension } from '@/lib/hooks/use-request-extension'
import { cn } from '@/lib/utils'

const extensionRequestSchema = z.object({
  reason: z
    .string()
    .min(10, 'Please provide a reason with at least 10 characters')
    .max(500, 'Reason must be less than 500 characters'),
})

type ExtensionFormData = z.infer<typeof extensionRequestSchema>

interface ExtensionFormProps {
  userQuestId: string
  deadline: string
  onSuccess?: () => void
  onCancel?: () => void
  className?: string
}

function formatDeadline(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function ExtensionForm({
  userQuestId,
  deadline,
  onSuccess,
  onCancel,
  className,
}: ExtensionFormProps) {
  const { mutate: requestExtension, isPending, error } = useRequestExtension({
    onSuccess,
  })

  const form = useForm<ExtensionFormData>({
    resolver: zodResolver(extensionRequestSchema),
    defaultValues: {
      reason: '',
    },
  })

  const handleSubmit = form.handleSubmit((data) => {
    requestExtension({
      userQuestId,
      reason: data.reason,
    })
  })

  const characterCount = form.watch('reason')?.length || 0

  return (
    <div className={cn('space-y-4', className)}>
      {/* Current Deadline Info */}
      <div className="flex items-center gap-2 p-3 rounded-md bg-muted">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <div className="text-sm">
          <span className="text-muted-foreground">Current deadline: </span>
          <span className="font-medium">{formatDeadline(deadline)}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="reason">Reason for Extension Request</Label>
          <Textarea
            id="reason"
            placeholder="Please explain why you need more time to complete this quest..."
            rows={5}
            {...form.register('reason')}
          />
          <div className="flex justify-between items-center">
            {form.formState.errors.reason ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.reason.message}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Provide a clear reason for your extension request
              </p>
            )}
            <span className={cn(
              'text-xs',
              characterCount > 500 ? 'text-destructive' : 'text-muted-foreground'
            )}>
              {characterCount}/500
            </span>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
            {error.message}
          </div>
        )}

        <div className="flex gap-3 justify-end">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Request Extension'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
