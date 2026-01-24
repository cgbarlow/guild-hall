import { Metadata } from 'next'
import { GMQuestList } from '@/components/gm/gm-quest-list'

export const metadata: Metadata = {
  title: 'Quest Management | GM Dashboard',
  description: 'Create, edit, and manage quests for your guild',
}

export default function GMQuestsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Quest Management</h1>
        <p className="text-muted-foreground">
          Create, edit, and manage quests for your guild members
        </p>
      </div>
      <GMQuestList />
    </div>
  )
}
