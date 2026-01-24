'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface FeedbackFormProps {
  onSubmit: (feedback: string) => void | Promise<void>
  onCancel: () => void
  isLoading?: boolean
  title?: string
  placeholder?: string
  submitLabel?: string
  cancelLabel?: string
  minLength?: number
  maxLength?: number
}

export function FeedbackForm({
  onSubmit,
  onCancel,
  isLoading = false,
  title = 'Feedback',
  placeholder = 'Enter your feedback...',
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  minLength = 10,
  maxLength = 1000,
}: FeedbackFormProps) {
  const [feedback, setFeedback] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const trimmedFeedback = feedback.trim()

    if (trimmedFeedback.length < minLength) {
      setError(`Feedback must be at least ${minLength} characters`)
      return
    }

    if (trimmedFeedback.length > maxLength) {
      setError(`Feedback must be less than ${maxLength} characters`)
      return
    }

    await onSubmit(trimmedFeedback)
  }

  const charactersRemaining = maxLength - feedback.length
  const isValid = feedback.trim().length >= minLength && feedback.length <= maxLength

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="feedback">{title}</Label>
        <Textarea
          id="feedback"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder={placeholder}
          className="min-h-[120px]"
          disabled={isLoading}
        />
        <div className="flex items-center justify-between text-xs">
          {error ? (
            <p className="text-destructive">{error}</p>
          ) : (
            <p className="text-muted-foreground">
              Minimum {minLength} characters
            </p>
          )}
          <p
            className={
              charactersRemaining < 100
                ? 'text-amber-600'
                : 'text-muted-foreground'
            }
          >
            {charactersRemaining} characters remaining
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1"
        >
          {cancelLabel}
        </Button>
        <Button
          type="submit"
          variant="destructive"
          disabled={!isValid || isLoading}
          className="flex-1"
        >
          {isLoading ? 'Submitting...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
