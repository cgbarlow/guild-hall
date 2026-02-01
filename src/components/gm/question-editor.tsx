'use client'

import { useState } from 'react'
import { Plus, Trash2, GripVertical, Loader2, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface QuestionEditorProps {
  questId: string
}

interface Question {
  id: string
  question: string
  correct_answer: string
  order_index: number
}

/**
 * GM component to manage quest challenge questions
 */
export function QuestionEditor({ questId }: QuestionEditorProps) {
  const queryClient = useQueryClient()
  const [newQuestion, setNewQuestion] = useState('')
  const [newAnswer, setNewAnswer] = useState('')

  // Fetch current questions
  const { data: questions, isLoading } = useQuery({
    queryKey: ['quest-questions-gm', questId],
    queryFn: async (): Promise<Question[]> => {
      const supabase = createClient()

      try {
        const { data, error } = await supabase
          .from('quest_questions')
          .select('id, question, correct_answer, order_index')
          .eq('quest_id', questId)
          .order('order_index')

        if (error) {
          // Table might not exist yet
          console.warn('Questions fetch failed:', error.message)
          return []
        }

        return (data || []) as Question[]
      } catch {
        return []
      }
    },
  })

  // Add question mutation
  const addQuestion = useMutation({
    mutationFn: async ({ question, answer }: { question: string; answer: string }) => {
      const supabase = createClient()
      const nextOrder = (questions?.length || 0)

      const { error } = await (supabase
        .from('quest_questions') as ReturnType<typeof supabase.from>)
        .insert({
          quest_id: questId,
          question,
          correct_answer: answer,
          order_index: nextOrder,
        } as Record<string, unknown>)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quest-questions-gm', questId] })
      setNewQuestion('')
      setNewAnswer('')
    },
  })

  // Update question mutation
  const updateQuestion = useMutation({
    mutationFn: async ({
      id,
      question,
      answer,
    }: {
      id: string
      question: string
      answer: string
    }) => {
      const supabase = createClient()
      const { error } = await (supabase
        .from('quest_questions') as ReturnType<typeof supabase.from>)
        .update({ question, correct_answer: answer } as Record<string, unknown>)
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quest-questions-gm', questId] })
    },
  })

  // Delete question mutation
  const deleteQuestion = useMutation({
    mutationFn: async (questionId: string) => {
      const supabase = createClient()
      const { error } = await (supabase
        .from('quest_questions') as ReturnType<typeof supabase.from>)
        .delete()
        .eq('id', questionId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quest-questions-gm', questId] })
    },
  })

  const handleAdd = () => {
    if (newQuestion.trim() && newAnswer.trim()) {
      addQuestion.mutate({ question: newQuestion.trim(), answer: newAnswer.trim() })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5" />
          Challenge Questions
        </CardTitle>
        <CardDescription>
          Users must answer all questions correctly to complete the quest
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
            {/* Current questions */}
            {questions && questions.length > 0 ? (
              <div className="space-y-4">
                {questions.map((q, index) => (
                  <QuestionItem
                    key={q.id}
                    question={q}
                    index={index}
                    onUpdate={(question, answer) =>
                      updateQuestion.mutate({ id: q.id, question, answer })
                    }
                    onDelete={() => deleteQuestion.mutate(q.id)}
                    isUpdating={updateQuestion.isPending}
                    isDeleting={deleteQuestion.isPending}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No challenge questions yet. Add questions to test user comprehension.
              </p>
            )}

            {/* Add new question */}
            <div className="pt-4 border-t space-y-3">
              <p className="text-sm font-medium">Add New Question</p>
              <div className="space-y-2">
                <div className="space-y-1">
                  <Label htmlFor="new-question" className="text-xs text-muted-foreground">
                    Question
                  </Label>
                  <Input
                    id="new-question"
                    placeholder="What is the capital of France?"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="new-answer" className="text-xs text-muted-foreground">
                    Correct Answer (case-insensitive)
                  </Label>
                  <Input
                    id="new-answer"
                    placeholder="Paris"
                    value={newAnswer}
                    onChange={(e) => setNewAnswer(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newQuestion.trim() && newAnswer.trim()) {
                        handleAdd()
                      }
                    }}
                  />
                </div>
              </div>
              <Button
                onClick={handleAdd}
                disabled={!newQuestion.trim() || !newAnswer.trim() || addQuestion.isPending}
                className="w-full"
              >
                {addQuestion.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Add Question
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

interface QuestionItemProps {
  question: Question
  index: number
  onUpdate: (question: string, answer: string) => void
  onDelete: () => void
  isUpdating: boolean
  isDeleting: boolean
}

function QuestionItem({
  question,
  index,
  onUpdate,
  onDelete,
  isUpdating,
  isDeleting,
}: QuestionItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editQuestion, setEditQuestion] = useState(question.question)
  const [editAnswer, setEditAnswer] = useState(question.correct_answer)

  const handleSave = () => {
    if (editQuestion.trim() && editAnswer.trim()) {
      onUpdate(editQuestion.trim(), editAnswer.trim())
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    setEditQuestion(question.question)
    setEditAnswer(question.correct_answer)
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="p-3 rounded-lg border space-y-2">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Question</Label>
          <Input
            value={editQuestion}
            onChange={(e) => setEditQuestion(e.target.value)}
            autoFocus
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Answer</Label>
          <Input value={editAnswer} onChange={(e) => setEditAnswer(e.target.value)} />
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isUpdating}>
            {isUpdating && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
            Save
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-3 rounded-lg border flex items-start gap-3">
      <GripVertical className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium mb-1">
          {index + 1}. {question.question}
        </p>
        <p className="text-xs text-muted-foreground">
          Answer: <span className="font-mono">{question.correct_answer}</span>
        </p>
      </div>
      <div className="flex gap-1 flex-shrink-0">
        <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="h-8 px-2">
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          disabled={isDeleting}
          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
        >
          {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}
