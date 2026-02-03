'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useCreateQuest } from '@/lib/hooks/use-create-quest'
import { useCategories } from '@/lib/hooks/use-categories'
import { questFormSchema, type QuestFormData } from '@/lib/schemas/quest.schema'
import { Loader2, Save, ArrowLeft, Star, Swords, Plus, X, ExternalLink, Lock } from 'lucide-react'
import Link from 'next/link'
import type { QuestDifficulty } from '@/lib/types/quest'

const DIFFICULTY_LEVELS: QuestDifficulty[] = ['Apprentice', 'Journeyman', 'Expert', 'Master']

interface QuestFormProps {
  initialData?: Partial<QuestFormData>
  onSuccess?: (questId: string) => void
}

export function QuestForm({ initialData, onSuccess }: QuestFormProps) {
  const router = useRouter()
  const { data: categories } = useCategories()
  const createQuest = useCreateQuest()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<QuestFormData>({
    resolver: zodResolver(questFormSchema),
    defaultValues: {
      title: '',
      description: '',
      category_id: null,
      points: 100,
      completion_days: 7,
      reward_description: '',
      narrative_context: '',
      transformation_goal: '',
      is_template: false,
      is_side_quest: false,
      resources: [],
      design_notes: '',
      featured: false,
      is_exclusive: false,
      exclusive_code: '',
      ...initialData,
    },
  })

  const isTemplate = watch('is_template')
  const categoryId = watch('category_id')
  const isSideQuest = watch('is_side_quest')
  const isFeatured = watch('featured')
  const isExclusive = watch('is_exclusive')
  const exclusiveCode = watch('exclusive_code')
  const resources = watch('resources') ?? []

  const addResource = () => {
    const newResources = [...resources, { title: '', url: '' }]
    setValue('resources', newResources)
  }

  const removeResource = (index: number) => {
    const newResources = resources.filter((_, i) => i !== index)
    setValue('resources', newResources)
  }

  const updateResource = (index: number, field: 'title' | 'url', value: string) => {
    const newResources = [...resources]
    newResources[index] = { ...newResources[index], [field]: value }
    setValue('resources', newResources)
  }

  const onSubmit = async (data: QuestFormData) => {
    try {
      const result = await createQuest.mutateAsync(data)
      if (onSuccess) {
        onSuccess(result.id)
      } else {
        router.push(`/gm/quests/${result.id}`)
      }
    } catch (error) {
      console.error('Failed to create quest:', error)
    }
  }

  return (
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
              onValueChange={(value) => setValue('category_id', value || null)}
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
            {errors.category_id && (
              <p className="text-sm text-destructive">{errors.category_id.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quest Type & Difficulty */}
      <Card>
        <CardHeader>
          <CardTitle>Quest Type & Difficulty</CardTitle>
          <CardDescription>
            Set the quest type and difficulty level
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Side Quest Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-500" />
                <Label htmlFor="is_side_quest">Side Quest</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Side quests are special bonus tasks that earn extra kudos. They appear in a dedicated section on the Bounty Board.
              </p>
            </div>
            <Switch
              id="is_side_quest"
              checked={isSideQuest}
              onCheckedChange={(checked) => setValue('is_side_quest', checked)}
            />
          </div>

          {/* Difficulty Selector (hidden for side quests) */}
          {!isSideQuest && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Swords className="h-4 w-4" />
                <Label htmlFor="difficulty">Difficulty Level</Label>
              </div>
              <Select
                value={watch('difficulty') || 'Apprentice'}
                onValueChange={(value) => setValue('difficulty', value as QuestDifficulty)}
              >
                <SelectTrigger id="difficulty">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTY_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Higher difficulty quests provide more challenge and prestige
              </p>
            </div>
          )}
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
              placeholder="Describe any additional rewards (e.g., badges, unlocks)"
              {...register('reward_description')}
              aria-invalid={!!errors.reward_description}
            />
            {errors.reward_description && (
              <p className="text-sm text-destructive">{errors.reward_description.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Time Constraints */}
      <Card>
        <CardHeader>
          <CardTitle>Time Constraints</CardTitle>
          <CardDescription>
            Set deadlines and time limits for quest completion
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Completion Days */}
          <div className="space-y-2">
            <Label htmlFor="completion_days">Days to Complete</Label>
            <Input
              id="completion_days"
              type="number"
              min={1}
              max={365}
              placeholder="7"
              {...register('completion_days', { valueAsNumber: true })}
              aria-invalid={!!errors.completion_days}
            />
            <p className="text-sm text-muted-foreground">
              Number of days adventurers have to complete the quest after accepting
            </p>
            {errors.completion_days && (
              <p className="text-sm text-destructive">{errors.completion_days.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Story & Context */}
      <Card>
        <CardHeader>
          <CardTitle>Story & Context</CardTitle>
          <CardDescription>
            Add narrative elements to make the quest more engaging
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Narrative Context */}
          <div className="space-y-2">
            <Label htmlFor="narrative_context">Narrative Context</Label>
            <Textarea
              id="narrative_context"
              placeholder="Set the scene for this quest..."
              {...register('narrative_context')}
              aria-invalid={!!errors.narrative_context}
            />
            {errors.narrative_context && (
              <p className="text-sm text-destructive">{errors.narrative_context.message}</p>
            )}
          </div>

          {/* Transformation Goal */}
          <div className="space-y-2">
            <Label htmlFor="transformation_goal">Transformation Goal</Label>
            <Textarea
              id="transformation_goal"
              placeholder="What will the adventurer learn or achieve?"
              {...register('transformation_goal')}
              aria-invalid={!!errors.transformation_goal}
            />
            <p className="text-sm text-muted-foreground">
              The intended learning outcome or personal growth from completing this quest
            </p>
            {errors.transformation_goal && (
              <p className="text-sm text-destructive">{errors.transformation_goal.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

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
              onCheckedChange={(checked) => setValue('featured', checked)}
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
              onCheckedChange={(checked) => setValue('is_template', checked)}
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
                setValue('is_exclusive', checked)
                if (!checked) {
                  setValue('exclusive_code', '')
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
                onChange={(e) => setValue('exclusive_code', e.target.value)}
                className="font-mono"
              />
              <p className="text-sm text-muted-foreground">
                Share this code with users who should have access to the quest
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex items-center justify-between">
        <Button variant="outline" asChild>
          <Link href="/gm/quests">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancel
          </Link>
        </Button>
        <Button type="submit" disabled={isSubmitting || createQuest.isPending}>
          {(isSubmitting || createQuest.isPending) && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          <Save className="mr-2 h-4 w-4" />
          Create Quest
        </Button>
      </div>

      {/* Error Display */}
      {createQuest.isError && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
          Failed to create quest. Please try again.
        </div>
      )}
    </form>
  )
}
