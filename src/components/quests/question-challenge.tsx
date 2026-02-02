'use client'

import { useState } from 'react'
import { HelpCircle, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useQuestQuestionStatus, useSubmitQuestAnswer } from '@/lib/hooks/use-quest-questions'
import { cn } from '@/lib/utils'

interface QuestionChallengeProps {
  userQuestId: string
  questTitle: string
  className?: string
}

/**
 * Challenge questions component for quest completion
 */
export function QuestionChallenge({
  userQuestId,
  questTitle,
  className,
}: QuestionChallengeProps) {
  const { data: questions, isLoading } = useQuestQuestionStatus(userQuestId)
  const submitAnswer = useSubmitQuestAnswer()
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [feedback, setFeedback] = useState<Record<string, 'correct' | 'incorrect' | null>>({})

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading questions...
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!questions || questions.length === 0) {
    return null
  }

  const answeredCorrectly = questions.filter((q) => q.is_correct).length
  const allComplete = answeredCorrectly === questions.length

  const handleSubmit = async (questionId: string) => {
    const answer = answers[questionId]?.trim()
    if (!answer) return

    setFeedback((prev) => ({ ...prev, [questionId]: null }))

    try {
      const result = await submitAnswer.mutateAsync({
        userQuestId,
        questionId,
        answer,
      })

      setFeedback((prev) => ({
        ...prev,
        [questionId]: result.is_correct ? 'correct' : 'incorrect',
      }))

      // Clear the input if incorrect so they can try again
      if (!result.is_correct) {
        setTimeout(() => {
          setFeedback((prev) => ({ ...prev, [questionId]: null }))
        }, 3000)
      }
    } catch (error) {
      console.error('Failed to submit answer:', error)
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-purple-500" />
          <CardTitle className="text-lg">Challenge Questions</CardTitle>
        </div>
        <CardDescription>
          Answer these questions to complete &ldquo;{questTitle}&rdquo;
          <span className="ml-2">
            ({answeredCorrectly}/{questions.length} correct)
          </span>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {allComplete && (
          <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300 text-sm">
            ✓ All questions answered correctly! You can now claim your reward.
          </div>
        )}

        {questions.map((question, index) => (
          <div
            key={question.question_id}
            className={cn(
              'p-4 rounded-lg border',
              question.is_correct && 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
            )}
          >
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                {index + 1}
              </span>
              <div className="flex-1 space-y-3">
                <p className="font-medium">{question.question}</p>

                {question.is_correct ? (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-sm">Answered correctly!</span>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Your answer..."
                      value={answers[question.question_id] || ''}
                      onChange={(e) =>
                        setAnswers((prev) => ({
                          ...prev,
                          [question.question_id]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSubmit(question.question_id)
                        }
                      }}
                      disabled={submitAnswer.isPending}
                      className="flex-1"
                    />
                    <Button
                      onClick={() => handleSubmit(question.question_id)}
                      disabled={
                        submitAnswer.isPending || !answers[question.question_id]?.trim()
                      }
                    >
                      {submitAnswer.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Submit'
                      )}
                    </Button>
                  </div>
                )}

                {feedback[question.question_id] === 'incorrect' && (
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <XCircle className="h-4 w-4" />
                    <span className="text-sm">Incorrect, try again!</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
