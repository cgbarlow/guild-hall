import { Metadata } from 'next'
import { QuestForm } from '@/components/gm/quest-form'

export const metadata: Metadata = {
  title: 'Create Quest | GM Dashboard',
  description: 'Create a new quest for your guild members',
}

export default function NewQuestPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Quest</h1>
        <p className="text-muted-foreground">
          Design a new quest for your guild members to embark on
        </p>
      </div>
      <QuestForm />
    </div>
  )
}
