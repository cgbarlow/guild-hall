'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Award, Clock, Plus, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useTemplates, useCloneTemplate } from '@/lib/hooks/use-templates'
import type { Quest } from '@/lib/types/quest'

interface TemplatePickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function TemplateCard({
  template,
  onSelect,
  isCloning,
}: {
  template: Quest
  onSelect: () => void
  isCloning: boolean
}) {
  return (
    <Card
      className="cursor-pointer transition-all hover:border-primary hover:shadow-md"
      onClick={onSelect}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base">{template.title}</CardTitle>
          {isCloning && <Loader2 className="h-4 w-4 animate-spin" />}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {template.description || 'No description'}
        </p>
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-1 text-amber-600">
            <Award className="h-3.5 w-3.5" />
            <span>{template.points} pts</span>
          </div>
          {template.completion_days && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>{template.completion_days} days</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function TemplatesSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-full mb-3" />
            <div className="flex gap-3">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function TemplatePicker({ open, onOpenChange }: TemplatePickerProps) {
  const router = useRouter()
  const { data: templates, isLoading } = useTemplates()
  const cloneTemplate = useCloneTemplate()
  const [cloningId, setCloningId] = useState<string | null>(null)

  const handleSelectTemplate = async (template: Quest) => {
    setCloningId(template.id)
    try {
      const newQuest = await cloneTemplate.mutateAsync({
        templateId: template.id,
      })
      onOpenChange(false)
      router.push(`/gm/quests/${newQuest.id}`)
    } catch (error) {
      console.error('Failed to clone template:', error)
    } finally {
      setCloningId(null)
    }
  }

  const handleCreateBlank = () => {
    onOpenChange(false)
    router.push('/gm/quests/new')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Create New Quest
          </DialogTitle>
          <DialogDescription>
            Start from scratch or choose a template to get started quickly
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Blank quest option */}
          <Card
            className="cursor-pointer border-dashed transition-all hover:border-primary hover:bg-muted/50"
            onClick={handleCreateBlank}
          >
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <Plus className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-medium">Start from Scratch</h3>
                <p className="text-sm text-muted-foreground">
                  Create a blank quest with no pre-filled content
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Templates section */}
          {isLoading ? (
            <TemplatesSkeleton />
          ) : templates && templates.length > 0 ? (
            <>
              <div className="flex items-center gap-2">
                <h3 className="font-medium">Or use a template</h3>
                <Badge variant="secondary">{templates.length}</Badge>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {templates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onSelect={() => handleSelectTemplate(template)}
                    isCloning={cloningId === template.id}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="mx-auto h-12 w-12 mb-3 opacity-50" />
              <p>No templates available yet</p>
              <p className="text-sm">
                Create a quest and mark it as a template to use it here
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
