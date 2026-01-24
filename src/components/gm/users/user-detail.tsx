'use client'

import { User, Award, Scroll, Calendar, Mail, Shield } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import type { UserWithRole } from '@/lib/hooks/use-all-users'
import { useUserQuestCounts, useUserQuestHistory } from '@/lib/hooks/use-all-users'

interface UserDetailProps {
  user: UserWithRole
}

function getRoleBadge(role: string | null): { label: string; variant: 'default' | 'secondary' | 'outline' } {
  switch (role) {
    case 'admin':
      return { label: 'Admin', variant: 'default' }
    case 'gm':
      return { label: 'Game Master', variant: 'secondary' }
    default:
      return { label: 'Member', variant: 'outline' }
  }
}

function formatDate(dateString: string | null): string {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function getQuestStatusBadge(status: string): { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' } {
  switch (status) {
    case 'completed':
      return { label: 'Completed', variant: 'default' }
    case 'in_progress':
      return { label: 'In Progress', variant: 'secondary' }
    case 'accepted':
      return { label: 'Accepted', variant: 'outline' }
    case 'abandoned':
      return { label: 'Abandoned', variant: 'outline' }
    case 'expired':
      return { label: 'Expired', variant: 'destructive' }
    default:
      return { label: status, variant: 'outline' }
  }
}

export function UserDetail({ user }: UserDetailProps) {
  const roleBadge = getRoleBadge(user.role)
  const { data: counts, isLoading: countsLoading } = useUserQuestCounts(user.id)
  const { data: questHistory, isLoading: historyLoading } = useUserQuestHistory(user.id)

  return (
    <div className="space-y-6">
      {/* User Info Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center shrink-0">
              {user.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatar_url}
                  alt={user.display_name || 'User'}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <User className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-2xl">
                  {user.display_name || 'Anonymous User'}
                </CardTitle>
                <Badge variant={roleBadge.variant}>
                  <Shield className="h-3 w-3 mr-1" />
                  {roleBadge.label}
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{user.email}</span>
              </div>
              {user.bio && (
                <p className="text-sm text-muted-foreground mt-2">{user.bio}</p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="flex items-center justify-center gap-1 text-amber-600 mb-1">
                <Award className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold">{user.total_points}</p>
              <p className="text-xs text-muted-foreground">Total Points</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                <Scroll className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold">{user.quests_completed}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                <Scroll className="h-5 w-5" />
              </div>
              {countsLoading ? (
                <Skeleton className="h-7 w-8 mx-auto" />
              ) : (
                <p className="text-2xl font-bold">{counts?.active ?? 0}</p>
              )}
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                <Calendar className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium">{formatDate(user.created_at)}</p>
              <p className="text-xs text-muted-foreground">Joined</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quest History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scroll className="h-5 w-5" />
            Quest History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : !questHistory || questHistory.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No quest history available.
            </p>
          ) : (
            <div className="divide-y">
              {questHistory.map((uq) => {
                const statusBadge = getQuestStatusBadge(uq.status)
                return (
                  <div
                    key={uq.id}
                    className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">
                        {uq.quest?.title || 'Unknown Quest'}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{uq.quest?.points || 0} pts</span>
                        <span>Accepted {formatDate(uq.accepted_at)}</span>
                        {uq.completed_at && (
                          <span>Completed {formatDate(uq.completed_at)}</span>
                        )}
                      </div>
                    </div>
                    <Badge variant={statusBadge.variant}>
                      {statusBadge.label}
                    </Badge>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
