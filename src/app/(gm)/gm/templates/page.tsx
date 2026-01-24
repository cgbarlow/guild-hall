'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Plus, Award, Clock, Copy, Loader2, MoreVertical, Trash2, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useTemplates, useCloneTemplate } from '@/lib/hooks/use-templates'
import { useDeleteQuest } from '@/lib/hooks/use-update-quest'
import type { Quest } from '@/lib/types/quest'
import Link from 'next/link'

function TemplatesSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-12 w-full mb-3" />
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

function TemplateCard({ template }: { template: Quest }) {
  const router = useRouter()
  const cloneTemplate = useCloneTemplate()
  const deleteQuest = useDeleteQuest()
  const [isCloning, setIsCloning] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleClone = async () => {
    setIsCloning(true)
    try {
      const newQuest = await cloneTemplate.mutateAsync({
        templateId: template.id,
      })
      router.push(`/gm/quests/${newQuest.id}`)
    } catch (error) {
      console.error('Failed to clone template:', error)
    } finally {
      setIsCloning(false)
    }
  }

  const handleDelete = async () => {
    try {
      await deleteQuest.mutateAsync(template.id)
    } catch (error) {
      console.error('Failed to delete template:', error)
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="text-base">{template.title}</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/gm/quests/${template.id}`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Template
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleClone} disabled={isCloning}>
                  {isCloning ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Copy className="mr-2 h-4 w-4" />
                  )}
                  Create Quest from Template
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Template
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{template.title}&quot;? This action cannot
              be undone. Quests created from this template will not be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default function TemplatesPage() {
  const { data: templates, isLoading, error } = useTemplates()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quest Templates</h1>
          <p className="text-muted-foreground">
            Reusable quest templates for quick creation
          </p>
        </div>
        <Button asChild>
          <Link href="/gm/quests/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Template
          </Link>
        </Button>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
          Failed to load templates. Please try again.
        </div>
      )}

      {/* Loading state */}
      {isLoading && <TemplatesSkeleton />}

      {/* Empty state */}
      {!isLoading && !error && templates?.length === 0 && (
        <Card className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <CardTitle className="mb-2">No templates yet</CardTitle>
          <CardDescription className="mb-4 text-center max-w-md">
            Create a quest and mark it as a template to reuse it quickly.
            Templates help you maintain consistency across similar quests.
          </CardDescription>
          <Button asChild>
            <Link href="/gm/quests/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Template
            </Link>
          </Button>
        </Card>
      )}

      {/* Templates grid */}
      {!isLoading && !error && templates && templates.length > 0 && (
        <>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{templates.length} template{templates.length !== 1 ? 's' : ''}</Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
