'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useUpdateQuest, usePublishQuest, useArchiveQuest, useUnpublishQuest, useDeleteQuest } from '@/lib/hooks/use-update-quest'
import { useCategories } from '@/lib/hooks/use-categories'
import { ObjectiveEditor } from './objective-editor'
import { questFormSchema, type QuestFormData } from '@/lib/schemas/quest.schema'
import type { Quest, QuestDbStatus } from '@/lib/types/quest'
import { Loader2, Save, ArrowLeft, Send, Archive, Trash2, RotateCcw } from 'lucide-react'
import Link from 'next/link'

interface QuestEditFormProps {
  quest: Quest
}

function getStatusBadgeVariant(status: QuestDbStatus): 'default' | 'secondary' | 'outline' {
  switch (status) {
    case 'published':
      return 'default'
    case 'draft':
      return 'secondary'
    case 'archived':
      return 'outline'
    default:
      return 'secondary'
  }
}

export function QuestEditForm({ quest }: QuestEditFormProps) {
  const router = useRouter()
  const { data: categories } = useCategories()
  const updateQuest = useUpdateQuest()
  const publishQuest = usePublishQuest()
  const archiveQuest = useArchiveQuest()
  const unpublishQuest = useUnpublishQuest()
  const deleteQuest = useDeleteQuest()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<QuestFormData>({
    resolver: zodResolver(questFormSchema),
    defaultValues: {
      title: quest.title,
      description: quest.description ?? '',
      category_id: quest.category_id,
      points: quest.points,
      completion_days: quest.completion_days ?? 7,
      reward_description: quest.reward_description ?? '',
      narrative_context: quest.narrative_context ?? '',
      transformation_goal: quest.transformation_goal ?? '',
      is_template: quest.is_template,
    },
  })

  const isTemplate = watch('is_template')
  const categoryId = watch('category_id')

  const status = quest.status as QuestDbStatus
  const isPublished = status === 'published'
  const isArchived = status === 'archived'
  const isDraft = status === 'draft'

  const onSubmit = async (data: QuestFormData) => {
    try {
      await updateQuest.mutateAsync({ id: quest.id, data })
    } catch (error) {
      console.error('Failed to update quest:', error)
    }
  }

  const handlePublish = async () => {
    try {
      await publishQuest.mutateAsync(quest.id)
    } catch (error) {
      console.error('Failed to publish quest:', error)
    }
  }

  const handleUnpublish = async () => {
    try {
      await unpublishQuest.mutateAsync(quest.id)
    } catch (error) {
      console.error('Failed to unpublish quest:', error)
    }
  }

  const handleArchive = async () => {
    try {
      await archiveQuest.mutateAsync(quest.id)
      router.push('/gm/quests')
    } catch (error) {
      console.error('Failed to archive quest:', error)
    }
  }

  const handleDelete = async () => {
    try {
      await deleteQuest.mutateAsync(quest.id)
      router.push('/gm/quests')
    } catch (error) {
      console.error('Failed to delete quest:', error)
    }
  }

  const isSaving = isSubmitting || updateQuest.isPending

  return (
    <div className="space-y-8">
      {/* Header with status and actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/gm/quests">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <Badge variant={getStatusBadgeVariant(status)}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {/* Status actions */}
          {isDraft && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button disabled={publishQuest.isPending}>
                  {publishQuest.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Publish
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Publish Quest</AlertDialogTitle>
                  <AlertDialogDescription>
                    Publishing this quest will make it visible to all guild members.
                    They will be able to accept and start working on it.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handlePublish}>Publish</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {isPublished && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" disabled={unpublishQuest.isPending}>
                  {unpublishQuest.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RotateCcw className="mr-2 h-4 w-4" />
                  )}
                  Unpublish
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Unpublish Quest</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will hide the quest from guild members. Existing participants
                    will still be able to see and complete it.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleUnpublish}>Unpublish</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {!isArchived && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" disabled={archiveQuest.isPending}>
                  {archiveQuest.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Archive className="mr-2 h-4 w-4" />
                  )}
                  Archive
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Archive Quest</AlertDialogTitle>
                  <AlertDialogDescription>
                    Archiving will remove this quest from the active list.
                    Existing participants can still complete it.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleArchive}>Archive</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={deleteQuest.isPending}>
                {deleteQuest.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Quest</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. All objectives and progress data
                  for this quest will be permanently deleted.
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
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              The essential details of your quest
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Enter quest title"
                {...register('title')}
                aria-invalid={!!errors.title}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the quest objectives and context"
                className="min-h-[120px]"
                {...register('description')}
                aria-invalid={!!errors.description}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category_id">Category</Label>
              <Select
                value={categoryId ?? undefined}
                onValueChange={(value) => setValue('category_id', value || null, { shouldDirty: true })}
              >
                <SelectTrigger id="category_id">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Rewards & Points */}
        <Card>
          <CardHeader>
            <CardTitle>Rewards & Points</CardTitle>
            <CardDescription>
              Set the rewards adventurers will earn
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Points */}
            <div className="space-y-2">
              <Label htmlFor="points">
                Points <span className="text-destructive">*</span>
              </Label>
              <Input
                id="points"
                type="number"
                min={0}
                max={10000}
                {...register('points', { valueAsNumber: true })}
                aria-invalid={!!errors.points}
              />
              {errors.points && (
                <p className="text-sm text-destructive">{errors.points.message}</p>
              )}
            </div>

            {/* Reward Description */}
            <div className="space-y-2">
              <Label htmlFor="reward_description">Reward Description</Label>
              <Textarea
                id="reward_description"
                placeholder="Describe any additional rewards"
                {...register('reward_description')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Time Constraints */}
        <Card>
          <CardHeader>
            <CardTitle>Time Constraints</CardTitle>
            <CardDescription>
              Set deadlines and time limits
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="completion_days">Days to Complete</Label>
              <Input
                id="completion_days"
                type="number"
                min={1}
                max={365}
                {...register('completion_days', { valueAsNumber: true })}
              />
              <p className="text-sm text-muted-foreground">
                Number of days adventurers have to complete the quest
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Story & Context */}
        <Card>
          <CardHeader>
            <CardTitle>Story & Context</CardTitle>
            <CardDescription>
              Add narrative elements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="narrative_context">Narrative Context</Label>
              <Textarea
                id="narrative_context"
                placeholder="Set the scene..."
                {...register('narrative_context')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="transformation_goal">Transformation Goal</Label>
              <Textarea
                id="transformation_goal"
                placeholder="What will the adventurer learn or achieve?"
                {...register('transformation_goal')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Template Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Template Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="is_template">Save as Template</Label>
                <p className="text-sm text-muted-foreground">
                  Templates can be cloned to create new quests
                </p>
              </div>
              <Switch
                id="is_template"
                checked={isTemplate}
                onCheckedChange={(checked) => setValue('is_template', checked, { shouldDirty: true })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Save button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving || !isDirty}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>

        {/* Error Display */}
        {updateQuest.isError && (
          <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
            Failed to save changes. Please try again.
          </div>
        )}
      </form>

      {/* Objectives Editor */}
      <ObjectiveEditor questId={quest.id} />
    </div>
  )
}
