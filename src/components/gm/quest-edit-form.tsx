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
import { ImageUpload } from '@/components/ui/image-upload'
import { uploadQuestBadge, removeQuestBadge } from '@/lib/actions/badge'
import { useQueryClient } from '@tanstack/react-query'
import { questFormSchema, type QuestFormData, type QuestDifficultyType } from '@/lib/schemas/quest.schema'
import type { Quest, QuestDbStatus, QuestResource } from '@/lib/types/quest'
import { Loader2, Save, ArrowLeft, Send, Archive, Trash2, RotateCcw, Plus, X, ExternalLink, Lock } from 'lucide-react'
import Link from 'next/link'

const difficultyOptions: { value: QuestDifficultyType; label: string; description: string }[] = [
  { value: 'Apprentice', label: 'Apprentice', description: 'Entry-level, self-paced' },
  { value: 'Journeyman', label: 'Journeyman', description: 'Intermediate difficulty' },
  { value: 'Expert', label: 'Expert', description: 'Advanced, requires experience' },
  { value: 'Master', label: 'Master', description: 'Maximum challenge' },
]

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
  const queryClient = useQueryClient()
  const { data: categories } = useCategories()
  const updateQuest = useUpdateQuest()
  const publishQuest = usePublishQuest()
  const archiveQuest = useArchiveQuest()
  const unpublishQuest = useUnpublishQuest()
  const deleteQuest = useDeleteQuest()

  // Badge upload handlers
  const handleBadgeUpload = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const result = await uploadQuestBadge(quest.id, formData)
    if (result.success) {
      queryClient.invalidateQueries({ queryKey: ['quest', quest.id] })
      queryClient.invalidateQueries({ queryKey: ['quests'] })
    }
    return result
  }

  const handleBadgeRemove = async () => {
    const result = await removeQuestBadge(quest.id)
    if (result.success) {
      queryClient.invalidateQueries({ queryKey: ['quest', quest.id] })
      queryClient.invalidateQueries({ queryKey: ['quests'] })
    }
    return result
  }

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
      difficulty: quest.difficulty ?? 'Apprentice',
      resources: quest.resources ?? [],
      design_notes: quest.design_notes ?? '',
      narrative_context: quest.narrative_context ?? '',
      transformation_goal: quest.transformation_goal ?? '',
      is_template: quest.is_template,
      featured: quest.featured ?? false,
      is_exclusive: quest.is_exclusive ?? false,
      exclusive_code: quest.exclusive_code ?? '',
    },
  })

  const isTemplate = watch('is_template')
  const isFeatured = watch('featured')
  const isExclusive = watch('is_exclusive')
  const exclusiveCode = watch('exclusive_code')
  const categoryId = watch('category_id')
  const difficulty = watch('difficulty')
  const resources = watch('resources') ?? []

  const addResource = () => {
    const newResources = [...resources, { title: '', url: '' }]
    setValue('resources', newResources, { shouldDirty: true })
  }

  const removeResource = (index: number) => {
    const newResources = resources.filter((_, i) => i !== index)
    setValue('resources', newResources, { shouldDirty: true })
  }

  const updateResource = (index: number, field: 'title' | 'url', value: string) => {
    const newResources = [...resources]
    newResources[index] = { ...newResources[index], [field]: value }
    setValue('resources', newResources, { shouldDirty: true })
  }

  const status = quest.status as QuestDbStatus
  const isPublished = status === 'published'
  const isArchived = status === 'archived'
  const isDraft = status === 'draft'

  const onSubmit = async (data: QuestFormData) => {
    try {
      console.log('Submitting quest update:', { id: quest.id, data })
      await updateQuest.mutateAsync({ id: quest.id, data })
    } catch (error) {
      console.error('Failed to update quest:', error instanceof Error ? error.message : error)
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
            {/* Title and Badge */}
            <div className="flex gap-4">
              <div className="flex-1 space-y-2">
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
              <div className="space-y-2">
                <Label>Badge</Label>
                <ImageUpload
                  currentImageUrl={quest.badge_url}
                  onUpload={handleBadgeUpload}
                  onRemove={handleBadgeRemove}
                  size="lg"
                  placeholderText="Badge"
                />
              </div>
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

            {/* Difficulty */}
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select
                value={difficulty}
                onValueChange={(value) => setValue('difficulty', value as QuestDifficultyType, { shouldDirty: true })}
              >
                <SelectTrigger id="difficulty">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  {difficultyOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex flex-col">
                        <span>{option.label}</span>
                        <span className="text-xs text-muted-foreground">{option.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Points */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="points">
                  Quest Points <span className="text-destructive">*</span>
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

              <div className="space-y-2">
                <Label htmlFor="reward_description">Reward Description</Label>
                <Input
                  id="reward_description"
                  placeholder="e.g., +1 Guild Rank"
                  {...register('reward_description')}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Story & Context */}
        <Card>
          <CardHeader>
            <CardTitle>Story & Context</CardTitle>
            <CardDescription>
              Add narrative elements to engage adventurers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="narrative_context">Narrative Context</Label>
              <Textarea
                id="narrative_context"
                placeholder="Set the scene..."
                className="min-h-[100px]"
                {...register('narrative_context')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="transformation_goal">Transformation Goal</Label>
              <Textarea
                id="transformation_goal"
                placeholder="What will the adventurer learn or achieve?"
                className="min-h-[80px]"
                {...register('transformation_goal')}
              />
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Objectives Editor - outside form for separate saves */}
      <ObjectiveEditor questId={quest.id} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Resources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              Resources
            </CardTitle>
            <CardDescription>
              Links to helpful resources for completing the quest
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {resources.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No resources added yet
              </p>
            ) : (
              <div className="space-y-3">
                {resources.map((resource, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="flex-1 grid gap-2 sm:grid-cols-2">
                      <Input
                        placeholder="Resource title"
                        value={resource.title}
                        onChange={(e) => updateResource(index, 'title', e.target.value)}
                      />
                      <Input
                        placeholder="https://..."
                        type="url"
                        value={resource.url}
                        onChange={(e) => updateResource(index, 'url', e.target.value)}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeResource(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <Button type="button" variant="outline" onClick={addResource} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Resource
            </Button>
          </CardContent>
        </Card>

        {/* Design Notes (GM Only) */}
        <Card>
          <CardHeader>
            <CardTitle>Design Notes</CardTitle>
            <CardDescription>
              Internal notes about quest design (not visible to adventurers)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              id="design_notes"
              placeholder="Add notes about quest design, rationale, or implementation details..."
              className="min-h-[120px]"
              {...register('design_notes')}
            />
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
                Number of days adventurers have to complete the quest after accepting
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Visibility Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Visibility Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="featured">Featured Quest</Label>
                <p className="text-sm text-muted-foreground">
                  Featured quests appear on the user dashboard
                </p>
              </div>
              <Switch
                id="featured"
                checked={isFeatured}
                onCheckedChange={(checked) => setValue('featured', checked, { shouldDirty: true })}
              />
            </div>
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

        {/* Exclusive Quest Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Exclusive Quest
            </CardTitle>
            <CardDescription>
              Require a special code to unlock this quest
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="is_exclusive">Enable Exclusive Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Users must enter the unlock code to accept this quest
                </p>
              </div>
              <Switch
                id="is_exclusive"
                checked={isExclusive}
                onCheckedChange={(checked) => {
                  setValue('is_exclusive', checked, { shouldDirty: true })
                  if (!checked) {
                    setValue('exclusive_code', '', { shouldDirty: true })
                  }
                }}
              />
            </div>

            {isExclusive && (
              <div className="space-y-2">
                <Label htmlFor="exclusive_code">Unlock Code</Label>
                <Input
                  id="exclusive_code"
                  placeholder="Enter the secret code"
                  value={exclusiveCode ?? ''}
                  onChange={(e) => setValue('exclusive_code', e.target.value, { shouldDirty: true })}
                  className="font-mono"
                />
                <p className="text-sm text-muted-foreground">
                  Share this code with users who should have access to the quest
                </p>
              </div>
            )}
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
    </div>
  )
}
