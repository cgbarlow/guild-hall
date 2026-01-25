'use client'

import Link from 'next/link'
import { User, Award, Scroll, Shield, Eye } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { UserWithRole } from '@/lib/hooks/use-all-users'
import { cn } from '@/lib/utils'

interface UserCardProps {
  user: UserWithRole
  isCurrentUser?: boolean
  className?: string
}

function getRoleBadge(role: string | null): { label: string; variant: 'default' | 'secondary' | 'outline' } {
  switch (role) {
    case 'admin':
      return { label: 'Admin', variant: 'default' }
    case 'gm':
      return { label: 'GM', variant: 'secondary' }
    default:
      return { label: 'Member', variant: 'outline' }
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function UserCard({ user, isCurrentUser, className }: UserCardProps) {
  const roleBadge = getRoleBadge(user.role)

  return (
    <Card className={cn('hover:border-primary/50 transition-colors', isCurrentUser && 'ring-2 ring-primary/50', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
              {user.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatar_url}
                  alt={user.display_name || 'User'}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <User className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div className="min-w-0">
              <CardTitle className="text-base leading-tight truncate">
                {user.display_name || 'Anonymous'}
                {isCurrentUser && <span className="ml-2 text-xs text-primary font-normal">(You)</span>}
              </CardTitle>
              <p className="text-xs text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          </div>
          <Badge variant={roleBadge.variant}>
            {roleBadge.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-amber-600">
              <Award className="h-4 w-4" />
              <span className="font-medium text-sm">{user.total_points} pts</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Scroll className="h-4 w-4" />
              <span className="text-sm">{user.quests_completed} completed</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Joined {formatDate(user.created_at)}
          </p>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/gm/users/${user.id}`}>
              <Eye className="mr-2 h-4 w-4" />
              View
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
