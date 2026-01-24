'use client'

import { User, Award, Scroll, Mail } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface UserContextProps {
  user: {
    id: string
    display_name: string | null
    email: string
    total_points: number
    avatar_url?: string | null
  } | null
  questsCompleted?: number
  activeQuests?: number
}

export function UserContext({ user, questsCompleted = 0, activeQuests = 0 }: UserContextProps) {
  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            User Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            User information not available.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <User className="h-5 w-5" />
          User Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          {/* Avatar placeholder */}
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            {user.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatar_url}
                alt={user.display_name || 'User'}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <User className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">
              {user.display_name || 'Anonymous User'}
            </p>
            <p className="text-sm text-muted-foreground flex items-center gap-1 truncate">
              <Mail className="h-3 w-3" />
              {user.email}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-md bg-muted/50">
            <div className="flex items-center justify-center gap-1 text-amber-600 mb-1">
              <Award className="h-4 w-4" />
            </div>
            <p className="text-lg font-bold">{user.total_points}</p>
            <p className="text-xs text-muted-foreground">Total Points</p>
          </div>
          <div className="text-center p-3 rounded-md bg-muted/50">
            <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
              <Scroll className="h-4 w-4" />
            </div>
            <p className="text-lg font-bold">{questsCompleted}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
          <div className="text-center p-3 rounded-md bg-muted/50">
            <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
              <Scroll className="h-4 w-4" />
            </div>
            <p className="text-lg font-bold">{activeQuests}</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </div>
        </div>

        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link href={`/gm/users/${user.id}`}>
            View Full Profile
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
