'use client'

import { FileText, Link as LinkIcon, ExternalLink, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface EvidenceViewerProps {
  evidenceText?: string | null
  evidenceUrl?: string | null
  evidenceType?: 'none' | 'text' | 'link' | 'text_or_link' | null
  submittedAt?: string | null
}

function formatDate(dateString: string | null): string {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function isValidUrl(string: string): boolean {
  try {
    new URL(string)
    return true
  } catch {
    return false
  }
}

export function EvidenceViewer({
  evidenceText,
  evidenceUrl,
  evidenceType,
  submittedAt,
}: EvidenceViewerProps) {
  const [copied, setCopied] = useState(false)

  const hasTextEvidence = !!evidenceText
  const hasUrlEvidence = !!evidenceUrl && isValidUrl(evidenceUrl)
  const hasEvidence = hasTextEvidence || hasUrlEvidence

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  if (!hasEvidence) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Evidence Submitted</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No evidence was provided for this submission.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            Evidence Submitted
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasTextEvidence && (
              <Badge variant="secondary">
                <FileText className="h-3 w-3 mr-1" />
                Text
              </Badge>
            )}
            {hasUrlEvidence && (
              <Badge variant="secondary">
                <LinkIcon className="h-3 w-3 mr-1" />
                Link
              </Badge>
            )}
          </div>
        </div>
        {submittedAt && (
          <p className="text-sm text-muted-foreground">
            Submitted on {formatDate(submittedAt)}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Text Evidence */}
        {hasTextEvidence && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Text Evidence
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(evidenceText!)}
                className="h-8"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <div className="rounded-md bg-muted p-4">
              <p className="text-sm whitespace-pre-wrap">{evidenceText}</p>
            </div>
          </div>
        )}

        {/* URL Evidence */}
        {hasUrlEvidence && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              Link Evidence
            </h4>
            <div className="flex items-center gap-2 rounded-md bg-muted p-3">
              <a
                href={evidenceUrl!}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline flex-1 truncate"
              >
                {evidenceUrl}
              </a>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="shrink-0"
              >
                <a
                  href={evidenceUrl!}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-3.5 w-3.5 mr-1" />
                  Open
                </a>
              </Button>
            </div>

            {/* URL Preview (for images) */}
            {evidenceUrl && /\.(jpg|jpeg|png|gif|webp)$/i.test(evidenceUrl) && (
              <div className="mt-3">
                <p className="text-xs text-muted-foreground mb-2">Image Preview:</p>
                <div className="rounded-md border overflow-hidden max-w-md">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={evidenceUrl}
                    alt="Evidence preview"
                    className="w-full h-auto max-h-64 object-contain bg-muted"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
