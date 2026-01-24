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
import { Loader2, Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

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
      ...initialData,
    },
  })

  const isTemplate = watch('is_template')
  const categoryId = watch('category_id')

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

      {/* Template Option */}
      <Card>
        <CardHeader>
          <CardTitle>Template Settings</CardTitle>
          <CardDescription>
            Save this quest as a reusable template
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="is_template">Save as Template</Label>
              <p className="text-sm text-muted-foreground">
                Templates can be cloned to create new quests quickly
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
