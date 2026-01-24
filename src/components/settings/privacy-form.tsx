'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { usePrivacySettings, useUpdatePrivacySettings } from '@/lib/hooks/use-privacy-settings'

export function PrivacyForm() {
  const { data: settings, isLoading } = usePrivacySettings()
  const updateSettings = useUpdatePrivacySettings()
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    show_profile: settings?.show_profile ?? true,
    show_stats: settings?.show_stats ?? true,
    show_activity: settings?.show_activity ?? true,
    allow_guild_invites: settings?.allow_guild_invites ?? true,
  })

  // Update form when settings load
  if (settings && formData.show_profile !== settings.show_profile) {
    setFormData({
      show_profile: settings.show_profile,
      show_stats: settings.show_stats,
      show_activity: settings.show_activity,
      allow_guild_invites: settings.allow_guild_invites,
    })
  }

  const handleToggle = (field: keyof typeof formData) => {
    setFormData((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await updateSettings.mutateAsync(formData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings')
    }
  }

  if (isLoading) {
    return <div className="text-muted-foreground">Loading settings...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Privacy Settings</CardTitle>
        <CardDescription>Control what others can see about you</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="show_profile">Show Profile</Label>
              <p className="text-sm text-muted-foreground">Allow others to view your profile</p>
            </div>
            <Switch
              id="show_profile"
              checked={formData.show_profile}
              onCheckedChange={() => handleToggle('show_profile')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="show_stats">Show Stats</Label>
              <p className="text-sm text-muted-foreground">Display your points and quest completion</p>
            </div>
            <Switch
              id="show_stats"
              checked={formData.show_stats}
              onCheckedChange={() => handleToggle('show_stats')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="show_activity">Show Activity</Label>
              <p className="text-sm text-muted-foreground">Let others see your recent activity</p>
            </div>
            <Switch
              id="show_activity"
              checked={formData.show_activity}
              onCheckedChange={() => handleToggle('show_activity')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="allow_guild_invites">Allow Guild Invites</Label>
              <p className="text-sm text-muted-foreground">Receive invitations to join guilds</p>
            </div>
            <Switch
              id="allow_guild_invites"
              checked={formData.allow_guild_invites}
              onCheckedChange={() => handleToggle('allow_guild_invites')}
            />
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded">{error}</div>
          )}

          {updateSettings.isSuccess && (
            <div className="text-sm text-green-600 bg-green-50 p-3 rounded">Settings updated successfully!</div>
          )}

          <Button type="submit" disabled={updateSettings.isPending}>
            {updateSettings.isPending ? 'Saving...' : 'Save Settings'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
