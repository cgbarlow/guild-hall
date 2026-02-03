'use client'

import { useState, useEffect } from 'react'
import { Bell, Save, User } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { createClient } from '@/lib/supabase/client'
import { useUserStreak, useUpdateWeekendBehavior } from '@/lib/hooks/use-user-streak'
import type { WeekendBehavior } from '@/lib/types/engagement'

const WEEKEND_BEHAVIORS: Array<{ value: WeekendBehavior; label: string; description: string }> = [
  {
    value: 'weekends_count',
    label: 'Weekends Count',
    description: 'Activity required on weekends to maintain streak',
  },
  {
    value: 'weekends_freeze',
    label: 'Weekends Freeze',
    description: 'Weekends don\'t affect your streak',
  },
  {
    value: 'weekends_optional',
    label: 'Weekends Optional',
    description: 'Weekend activity is bonus, missing doesn\'t break streak',
  },
]

export default function SettingsPage() {
  const [userId, setUserId] = useState<string | null>(null)

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id || null)
    }
    getUser()
  }, [])

  // Streak preferences
  const { data: streakInfo, isLoading: loadingStreak } = useUserStreak(userId || undefined)
  const { mutate: updateWeekendBehavior, isPending: savingStreak } = useUpdateWeekendBehavior()

  const [weekendBehavior, setWeekendBehavior] = useState<WeekendBehavior>('weekends_count')

  // Initialize form when data loads
  useEffect(() => {
    if (streakInfo) {
      setWeekendBehavior(streakInfo.weekendBehavior)
    }
  }, [streakInfo])

  const handleSaveStreak = () => {
    if (!userId) return
    updateWeekendBehavior({
      userId,
      behavior: weekendBehavior,
    })
  }

  if (!userId) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {loadingStreak ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : (
        <>
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <CardTitle>Profile Settings</CardTitle>
              </div>
              <CardDescription>
                Update your display name, bio, and avatar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild>
                <a href="/profile">Go to Profile</a>
              </Button>
            </CardContent>
          </Card>

          {/* Streak Preferences */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-orange-500" />
                <CardTitle>Streak Settings</CardTitle>
              </div>
              <CardDescription>
                Configure how weekends affect your activity streak.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {WEEKEND_BEHAVIORS.map(behavior => (
                  <div
                    key={behavior.value}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      weekendBehavior === behavior.value
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => setWeekendBehavior(behavior.value)}
                  >
                    <input
                      type="radio"
                      name="weekend-behavior"
                      value={behavior.value}
                      checked={weekendBehavior === behavior.value}
                      onChange={() => setWeekendBehavior(behavior.value)}
                      className="mt-1"
                    />
                    <div>
                      <Label className="font-medium">{behavior.label}</Label>
                      <p className="text-sm text-muted-foreground">
                        {behavior.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Button onClick={handleSaveStreak} disabled={savingStreak}>
                <Save className="mr-2 h-4 w-4" />
                {savingStreak ? 'Saving...' : 'Save Streak Settings'}
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
