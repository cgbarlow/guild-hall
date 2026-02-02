'use client'

import { useState } from 'react'
import { Plus, X, Link as LinkIcon, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface PrerequisiteSelectorProps {
  questId: string
}

interface QuestOption {
  id: string
  title: string
}

interface Prerequisite {
  id: string
  prerequisite_quest_id: string
  prerequisite_title: string
}

/**
 * GM component to manage quest prerequisites
 */
export function PrerequisiteSelector({ questId }: PrerequisiteSelectorProps) {
  const queryClient = useQueryClient()
  const [selectedQuestId, setSelectedQuestId] = useState<string>('')

  // Fetch all published quests (excluding current quest)
  const { data: availableQuests, isLoading: questsLoading } = useQuery({
    queryKey: ['available-prereq-quests', questId],
    queryFn: async (): Promise<QuestOption[]> => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('quests')
        .select('id, title')
        .neq('id', questId)
        .in('status', ['published', 'draft'])
        .order('title')

      if (error) {
        console.warn('Failed to fetch quests:', error.message)
        return []
      }

      return (data || []) as QuestOption[]
    },
  })

  // Fetch current prerequisites
  const { data: prerequisites, isLoading: prereqsLoading } = useQuery({
    queryKey: ['quest-prerequisites-gm', questId],
    queryFn: async (): Promise<Prerequisite[]> => {
      const supabase = createClient()

      try {
        const { data, error } = await supabase
          .from('quest_prerequisites')
          .select(`
            id,
            prerequisite_quest_id,
            quests:prerequisite_quest_id (title)
          `)
          .eq('quest_id', questId)

        if (error) {
          // Table might not exist yet
          console.warn('Prerequisites fetch failed:', error.message)
          return []
        }

        return (data || []).map((p: { id: string; prerequisite_quest_id: string; quests: { title: string } | null }) => ({
          id: p.id,
          prerequisite_quest_id: p.prerequisite_quest_id,
          prerequisite_title: p.quests?.title || 'Unknown Quest',
        }))
      } catch {
        return []
      }
    },
  })

  // Add prerequisite mutation
  const addPrerequisite = useMutation({
    mutationFn: async (prerequisiteQuestId: string) => {
      const supabase = createClient()
      const { error } = await (supabase
        .from('quest_prerequisites') as ReturnType<typeof supabase.from>)
        .insert({
          quest_id: questId,
          prerequisite_quest_id: prerequisiteQuestId,
        } as Record<string, unknown>)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quest-prerequisites-gm', questId] })
      setSelectedQuestId('')
    },
  })

  // Remove prerequisite mutation
  const removePrerequisite = useMutation({
    mutationFn: async (prerequisiteId: string) => {
      const supabase = createClient()
      const { error } = await (supabase
        .from('quest_prerequisites') as ReturnType<typeof supabase.from>)
        .delete()
        .eq('id', prerequisiteId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quest-prerequisites-gm', questId] })
    },
  })

  // Filter out already-added prerequisites
  const availableToAdd = availableQuests?.filter(
    (q) => !prerequisites?.some((p) => p.prerequisite_quest_id === q.id)
  ) || []

  const handleAdd = () => {
    if (selectedQuestId) {
      addPrerequisite.mutate(selectedQuestId)
    }
  }

  const isLoading = questsLoading || prereqsLoading

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LinkIcon className="h-5 w-5" />
          Quest Prerequisites
        </CardTitle>
        <CardDescription>
          Require completion of other quests before this one can be accepted (AND logic)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-4 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Loading...
          </div>
        ) : (
          <>
            {/* Current prerequisites */}
            {prerequisites && prerequisites.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Users must complete ALL of these quests first:
                </p>
                <ul className="space-y-2">
                  {prerequisites.map((prereq) => (
                    <li
                      key={prereq.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted"
                    >
                      <span className="text-sm font-medium">
                        {prereq.prerequisite_title}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePrerequisite.mutate(prereq.id)}
                        disabled={removePrerequisite.isPending}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        {removePrerequisite.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No prerequisites set. This quest can be accepted by anyone.
              </p>
            )}

            {/* Add new prerequisite */}
            {availableToAdd.length > 0 && (
              <div className="flex gap-2 pt-2 border-t">
                <Select value={selectedQuestId} onValueChange={setSelectedQuestId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a prerequisite quest..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableToAdd.map((quest) => (
                      <SelectItem key={quest.id} value={quest.id}>
                        {quest.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleAdd}
                  disabled={!selectedQuestId || addPrerequisite.isPending}
                >
                  {addPrerequisite.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}

            {availableToAdd.length === 0 && availableQuests && availableQuests.length > 0 && (
              <p className="text-sm text-muted-foreground text-center">
                All available quests are already prerequisites.
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
