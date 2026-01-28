'use client'

import { useState } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ObjectiveItem } from './objective-item'
import {
  useObjectives,
  useCreateObjective,
  useUpdateObjective,
  useDeleteObjective,
  useReorderObjectives,
} from '@/lib/hooks/use-objectives'
import type { ObjectiveFormData } from '@/lib/schemas/quest.schema'
import { Skeleton } from '@/components/ui/skeleton'

interface ObjectiveEditorProps {
  questId: string
  className?: string
}

function ObjectivesSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-9 flex-1" />
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function ObjectiveEditor({ questId, className }: ObjectiveEditorProps) {
  const { data: objectives, isLoading, error } = useObjectives(questId)
  const createObjective = useCreateObjective()
  const updateObjective = useUpdateObjective()
  const deleteObjective = useDeleteObjective()
  const reorderObjectives = useReorderObjectives()

  const [isAdding, setIsAdding] = useState(false)

  const handleAddObjective = async () => {
    setIsAdding(true)
    try {
      await createObjective.mutateAsync({
        quest_id: questId,
        title: 'New Objective',
        description: null,
        points: 10,
        display_order: objectives?.length ?? 0,
        depends_on_id: null,
        evidence_required: false,
        evidence_type: 'none',
        resource_url: null,
      })
    } catch (error) {
      console.error('Failed to create objective:', error)
    } finally {
      setIsAdding(false)
    }
  }

  const handleUpdateObjective = async (id: string, data: Partial<ObjectiveFormData>) => {
    try {
      await updateObjective.mutateAsync({ id, data })
    } catch (error) {
      console.error('Failed to update objective:', error)
    }
  }

  const handleDeleteObjective = async (id: string) => {
    try {
      await deleteObjective.mutateAsync(id)
    } catch (error) {
      console.error('Failed to delete objective:', error)
    }
  }

  const handleMoveUp = async (index: number) => {
    if (!objectives || index === 0) return

    const newOrder = [...objectives]
    const temp = newOrder[index]
    newOrder[index] = newOrder[index - 1]
    newOrder[index - 1] = temp

    const updates = newOrder.map((obj, i) => ({
      id: obj.id,
      display_order: i,
    }))

    try {
      await reorderObjectives.mutateAsync(updates)
    } catch (error) {
      console.error('Failed to reorder objectives:', error)
    }
  }

  const handleMoveDown = async (index: number) => {
    if (!objectives || index === objectives.length - 1) return

    const newOrder = [...objectives]
    const temp = newOrder[index]
    newOrder[index] = newOrder[index + 1]
    newOrder[index + 1] = temp

    const updates = newOrder.map((obj, i) => ({
      id: obj.id,
      display_order: i,
    }))

    try {
      await reorderObjectives.mutateAsync(updates)
    } catch (error) {
      console.error('Failed to reorder objectives:', error)
    }
  }

  const totalPoints = objectives?.reduce((sum, obj) => sum + obj.points, 0) ?? 0

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Objectives</CardTitle>
            <CardDescription>
              Define the steps adventurers need to complete
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{totalPoints}</div>
            <div className="text-xs text-muted-foreground">Total Points</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Error state */}
        {error && (
          <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
            Failed to load objectives. Please try again.
          </div>
        )}

        {/* Loading state */}
        {isLoading && <ObjectivesSkeleton />}

        {/* Empty state */}
        {!isLoading && !error && objectives?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="text-muted-foreground mb-4">
              No objectives yet. Add objectives to define what adventurers need to accomplish.
            </div>
          </div>
        )}

        {/* Objectives list */}
        {!isLoading && !error && objectives && objectives.length > 0 && (
          <div className="space-y-3">
            {objectives.map((objective, index) => (
              <ObjectiveItem
                key={objective.id}
                objective={objective}
                allObjectives={objectives}
                onUpdate={(data) => handleUpdateObjective(objective.id, data)}
                onDelete={() => handleDeleteObjective(objective.id)}
                onMoveUp={() => handleMoveUp(index)}
                onMoveDown={() => handleMoveDown(index)}
                isFirst={index === 0}
                isLast={index === objectives.length - 1}
              />
            ))}
          </div>
        )}

        {/* Add button */}
        <Button
          variant="outline"
          className="w-full"
          onClick={handleAddObjective}
          disabled={isAdding || createObjective.isPending}
        >
          {(isAdding || createObjective.isPending) ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          Add Objective
        </Button>

        {/* Tips */}
        <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
          <p className="font-medium mb-2">Tips for good objectives:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Keep each objective focused on a single task</li>
            <li>Use clear, actionable language</li>
            <li>Consider using dependencies to create a logical progression</li>
            <li>Require evidence for objectives that need verification</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
