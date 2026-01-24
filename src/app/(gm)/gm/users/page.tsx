'use client'

import { Users } from 'lucide-react'
import { UserList } from '@/components/gm/users/user-list'

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Users className="h-8 w-8" />
          Users
        </h1>
        <p className="text-muted-foreground">
          View and manage all users in the guild.
        </p>
      </div>

      <UserList />
    </div>
  )
}
