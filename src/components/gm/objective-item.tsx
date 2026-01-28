'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { GripVertical, Trash2, ChevronDown, ChevronUp, ArrowUp, ArrowDown, Link as LinkIcon, FileText, Lock, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { objectiveSchema, type ObjectiveFormData } from '@/lib/schemas/quest.schema'
import type { Objective } from '@/lib/types/quest'
import { cn } from '@/lib/utils'

interface ObjectiveItemProps {
  objective: Objective
  allObjectives: Objective[]
  onUpdate: (data: Partial<ObjectiveFormData>) => void
  onDelete: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
  isFirst?: boolean
  isLast?: boolean
  isDragging?: boolean
}

const evidenceTypeOptions = [
  { value: 'none', label: 'No evidence required', icon: null },
  { value: 'text', label: 'Text evidence', icon: FileText },
  { value: 'link', label: 'Link/URL', icon: LinkIcon },
  { value: 'text_or_link', label: 'Text or Link', icon: FileText },
] as const

export function ObjectiveItem({
  objective,
  allObjectives,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  isDragging,
}: ObjectiveItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ObjectiveFormData>({
    resolver: zodResolver(objectiveSchema),
    defaultValues: {
      title: objective.title,
      description: objective.description ?? '',
      points: objective.points,
      display_order: objective.display_order,
      depends_on_id: objective.depends_on_id,
      evidence_required: objective.evidence_required,
      evidence_type: objective.evidence_type,
      resource_url: (objective as { resource_url?: string | null }).resource_url ?? '',
    },
  })

  const evidenceRequired = watch('evidence_required')
  const dependsOnId = watch('depends_on_id')
  const evidenceType = watch('evidence_type')

  // Get available objectives for dependency selection (exclude self and objectives that depend on this one)
  const availableDependencies = allObjectives.filter((obj) => {
    if (obj.id === objective.id) return false
    // Prevent circular dependencies
    if (obj.depends_on_id === objective.id) return false
    return true
  })

  const handleFieldChange = (field: keyof ObjectiveFormData, value: unknown) => {
    setValue(field, value as ObjectiveFormData[typeof field])
    onUpdate({ [field]: value })
  }

  const dependencyLabel = dependsOnId
    ? allObjectives.find((o) => o.id === dependsOnId)?.title || 'Unknown'
    : 'None'

  return (
    <div
      className={cn(
        'rounded-lg border bg-card p-4 transition-all',
        isDragging && 'shadow-lg ring-2 ring-primary',
        isExpanded && 'ring-1 ring-primary/20'
      )}
    >
      {/* Header - always visible */}
      <div className="flex items-center gap-3">
        {/* Reorder controls */}
        <div className="flex flex-col items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 p-0"
            onClick={onMoveUp}
            disabled={isFirst}
            title="Move up"
          >
            <ArrowUp className={cn("h-4 w-4", isFirst ? "text-muted-foreground/30" : "text-muted-foreground hover:text-foreground")} />
          </Button>
          <GripVertical className="h-4 w-4 text-muted-foreground" />
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 p-0"
            onClick={onMoveDown}
            disabled={isLast}
            title="Move down"
          >
            <ArrowDown className={cn("h-4 w-4", isLast ? "text-muted-foreground/30" : "text-muted-foreground hover:text-foreground")} />
          </Button>
        </div>

        {/* Title and basic info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {dependsOnId && (
              <span title="Has dependency">
                <Lock className="h-4 w-4 text-muted-foreground" />
              </span>
            )}
            <Input
              value={watch('title')}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              className="font-medium"
              placeholder="Objective title"
            />
          </div>
        </div>

        {/* Points */}
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            max={1000}
            value={watch('points')}
            onChange={(e) => handleFieldChange('points', parseInt(e.target.value) || 0)}
            className="w-20 text-center"
          />
          <span className="text-sm text-muted-foreground">pts</span>
        </div>

        {/* Expand/collapse */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>

        {/* Delete */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Objective</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete &quot;{objective.title}&quot;? This action cannot be undone.
                {allObjectives.some((o) => o.depends_on_id === objective.id) && (
                  <span className="block mt-2 font-medium text-destructive">
                    Warning: Other objectives depend on this one and will become unlocked.
                  </span>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className="mt-4 space-y-4 border-t pt-4">
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor={`desc-${objective.id}`}>Description</Label>
            <Textarea
              id={`desc-${objective.id}`}
              value={watch('description') || ''}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              placeholder="Describe what the adventurer needs to do"
              className="min-h-[80px]"
            />
          </div>

          {/* Dependency Selection */}
          <div className="space-y-2">
            <Label>Depends On</Label>
            <Select
              value={dependsOnId ?? 'none'}
              onValueChange={(value) =>
                handleFieldChange('depends_on_id', value === 'none' ? null : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="No dependency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No dependency</SelectItem>
                {availableDependencies.map((obj) => (
                  <SelectItem key={obj.id} value={obj.id}>
                    {obj.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              If set, this objective will be locked until the selected objective is completed
            </p>
          </div>

          {/* Evidence Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor={`evidence-${objective.id}`}>Require Evidence</Label>
                <p className="text-xs text-muted-foreground">
                  Adventurers must submit proof of completion
                </p>
              </div>
              <Switch
                id={`evidence-${objective.id}`}
                checked={evidenceRequired}
                onCheckedChange={(checked) => {
                  handleFieldChange('evidence_required', checked)
                  if (!checked) {
                    handleFieldChange('evidence_type', 'none')
                  }
                }}
              />
            </div>

            {evidenceRequired && (
              <div className="space-y-2">
                <Label>Evidence Type</Label>
                <Select
                  value={evidenceType}
                  onValueChange={(value) =>
                    handleFieldChange('evidence_type', value as ObjectiveFormData['evidence_type'])
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {evidenceTypeOptions
                      .filter((opt) => opt.value !== 'none')
                      .map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            {option.icon && <option.icon className="h-4 w-4" />}
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Resource URL */}
          <div className="space-y-2">
            <Label htmlFor={`url-${objective.id}`} className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              Resource URL
            </Label>
            <Input
              id={`url-${objective.id}`}
              type="text"
              value={watch('resource_url') ?? ''}
              onChange={(e) => {
                const value = e.target.value.trim()
                handleFieldChange('resource_url', value === '' ? null : value)
              }}
              placeholder="https://example.com/resource"
            />
            <p className="text-xs text-muted-foreground">
              Optional link to a resource that helps complete this objective (opens in new tab)
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
