'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Link as LinkIcon, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { textEvidenceSchema, urlEvidenceSchema, type TextEvidenceFormData, type UrlEvidenceFormData } from '@/lib/schemas/evidence.schema'
import { useSubmitEvidence } from '@/lib/hooks/use-submit-evidence'
import { cn } from '@/lib/utils'
import type { Database } from '@/lib/types/database'

type EvidenceType = Database['public']['Tables']['objectives']['Row']['evidence_type']

interface EvidenceFormProps {
  userObjectiveId: string
  evidenceType: EvidenceType
  onSuccess?: () => void
  onCancel?: () => void
  className?: string
}

export function EvidenceForm({
  userObjectiveId,
  evidenceType,
  onSuccess,
  onCancel,
  className,
}: EvidenceFormProps) {
  // Determine which type of form to show
  const showTextForm = evidenceType === 'text' || evidenceType === 'text_or_link'
  const showUrlForm = evidenceType === 'link' || evidenceType === 'text_or_link'
  const [activeTab, setActiveTab] = useState<'text' | 'url'>(showTextForm ? 'text' : 'url')

  const { mutate: submitEvidence, isPending, error } = useSubmitEvidence({
    onSuccess,
  })

  // Text form
  const textForm = useForm<TextEvidenceFormData>({
    resolver: zodResolver(textEvidenceSchema),
    defaultValues: {
      evidenceText: '',
    },
  })

  // URL form
  const urlForm = useForm<UrlEvidenceFormData>({
    resolver: zodResolver(urlEvidenceSchema),
    defaultValues: {
      evidenceUrl: '',
    },
  })

  const handleTextSubmit = textForm.handleSubmit((data) => {
    submitEvidence({
      userObjectiveId,
      evidenceText: data.evidenceText,
    })
  })

  const handleUrlSubmit = urlForm.handleSubmit((data) => {
    submitEvidence({
      userObjectiveId,
      evidenceUrl: data.evidenceUrl,
    })
  })

  return (
    <div className={cn('space-y-4', className)}>
      {/* Tab Selector (if both types are available) */}
      {showTextForm && showUrlForm && (
        <div className="flex border-b">
          <button
            type="button"
            onClick={() => setActiveTab('text')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
              activeTab === 'text'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            <FileText className="h-4 w-4" />
            Text Description
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
              activeTab === 'url'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            <LinkIcon className="h-4 w-4" />
            Link/URL
          </button>
        </div>
      )}

      {/* Text Evidence Form */}
      {(activeTab === 'text' || !showUrlForm) && showTextForm && (
        <form onSubmit={handleTextSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="evidenceText">Evidence Description</Label>
            <Textarea
              id="evidenceText"
              placeholder="Describe the evidence for completing this objective..."
              rows={5}
              {...textForm.register('evidenceText')}
            />
            {textForm.formState.errors.evidenceText && (
              <p className="text-sm text-destructive">
                {textForm.formState.errors.evidenceText.message}
              </p>
            )}
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
                'Submit Evidence'
              )}
            </Button>
          </div>
        </form>
      )}

      {/* URL Evidence Form */}
      {(activeTab === 'url' || !showTextForm) && showUrlForm && (
        <form onSubmit={handleUrlSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="evidenceUrl">Evidence URL</Label>
            <Input
              id="evidenceUrl"
              type="url"
              placeholder="https://example.com/your-evidence"
              {...urlForm.register('evidenceUrl')}
            />
            {urlForm.formState.errors.evidenceUrl && (
              <p className="text-sm text-destructive">
                {urlForm.formState.errors.evidenceUrl.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Provide a link to your work, a screenshot, or other proof of completion.
            </p>
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
                'Submit Evidence'
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
