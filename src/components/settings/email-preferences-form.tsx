'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Loader2, Mail, Bell, Trophy, Target, Calendar, CheckCircle2, AlertCircle } from 'lucide-react'
import { useUserEmailPreferences, useUpdateUserEmailPreferences } from '@/lib/hooks/use-user-email-preferences'
import type { UserEmailPreferences } from '@/lib/types/engagement'

interface EmailPreferencesFormProps {
  userId: string
}

interface PreferenceToggleProps {
  id: string
  label: string
  description: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
}

function PreferenceToggle({
  id,
  label,
  description,
  checked,
  onCheckedChange,
  disabled,
}: PreferenceToggleProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <div className="space-y-0.5 pr-4">
        <Label htmlFor={id} className="text-sm font-medium cursor-pointer">
          {label}
        </Label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
    </div>
  )
}

export function EmailPreferencesForm({ userId }: EmailPreferencesFormProps) {
  const { data: preferences, isLoading } = useUserEmailPreferences(userId)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const updatePreferences = useUpdateUserEmailPreferences()

  // Local state for form
  const [formState, setFormState] = useState<Partial<UserEmailPreferences>>({
    quest_accepted_email: true,
    quest_completed_email: true,
    objective_submitted_email: true,
    objective_approved_email: true,
    objective_rejected_email: true,
    badge_earned_email: true,
    badge_ready_to_claim_email: true,
    weekly_progress_email: true,
    deadline_reminder_email: true,
  })

  const [hasChanges, setHasChanges] = useState(false)

  // Sync form state when preferences load
  useEffect(() => {
    if (preferences) {
      setFormState({
        quest_accepted_email: preferences.quest_accepted_email,
        quest_completed_email: preferences.quest_completed_email,
        objective_submitted_email: preferences.objective_submitted_email,
        objective_approved_email: preferences.objective_approved_email,
        objective_rejected_email: preferences.objective_rejected_email,
        badge_earned_email: preferences.badge_earned_email,
        badge_ready_to_claim_email: preferences.badge_ready_to_claim_email,
        weekly_progress_email: preferences.weekly_progress_email,
        deadline_reminder_email: preferences.deadline_reminder_email,
      })
      setHasChanges(false)
    }
  }, [preferences])

  const updateField = (field: keyof UserEmailPreferences, value: boolean) => {
    setFormState((prev) => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    setSaveStatus('idle')
    try {
      await updatePreferences.mutateAsync({
        user_id: userId,
        ...formState,
      })
      setHasChanges(false)
      setSaveStatus('success')
      // Reset success status after 3 seconds
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (error) {
      setSaveStatus('error')
      // Reset error status after 5 seconds
      setTimeout(() => setSaveStatus('idle'), 5000)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Quest Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Quest Notifications</CardTitle>
          </div>
          <CardDescription>
            Control emails related to quest acceptance and completion
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PreferenceToggle
            id="quest_accepted_email"
            label="Quest Accepted"
            description="Receive confirmation when you accept a new quest"
            checked={formState.quest_accepted_email ?? true}
            onCheckedChange={(checked) => updateField('quest_accepted_email', checked)}
            disabled={updatePreferences.isPending}
          />
          <PreferenceToggle
            id="quest_completed_email"
            label="Quest Completed"
            description="Receive notification when you complete a quest"
            checked={formState.quest_completed_email ?? true}
            onCheckedChange={(checked) => updateField('quest_completed_email', checked)}
            disabled={updatePreferences.isPending}
          />
        </CardContent>
      </Card>

      {/* Objective Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Objective Notifications</CardTitle>
          </div>
          <CardDescription>
            Control emails about objective submissions and reviews
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PreferenceToggle
            id="objective_submitted_email"
            label="Objective Submitted"
            description="Receive confirmation when you submit an objective for review"
            checked={formState.objective_submitted_email ?? true}
            onCheckedChange={(checked) => updateField('objective_submitted_email', checked)}
            disabled={updatePreferences.isPending}
          />
          <PreferenceToggle
            id="objective_approved_email"
            label="Objective Approved"
            description="Receive notification when your objective is approved by a GM"
            checked={formState.objective_approved_email ?? true}
            onCheckedChange={(checked) => updateField('objective_approved_email', checked)}
            disabled={updatePreferences.isPending}
          />
          <PreferenceToggle
            id="objective_rejected_email"
            label="Objective Needs Revision"
            description="Receive notification when your objective needs revision"
            checked={formState.objective_rejected_email ?? true}
            onCheckedChange={(checked) => updateField('objective_rejected_email', checked)}
            disabled={updatePreferences.isPending}
          />
        </CardContent>
      </Card>

      {/* Achievement Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            <CardTitle className="text-lg">Achievement Notifications</CardTitle>
          </div>
          <CardDescription>
            Control emails about badges and achievements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PreferenceToggle
            id="badge_earned_email"
            label="Badge Earned"
            description="Receive notification when you earn a new badge"
            checked={formState.badge_earned_email ?? true}
            onCheckedChange={(checked) => updateField('badge_earned_email', checked)}
            disabled={updatePreferences.isPending}
          />
          <PreferenceToggle
            id="badge_ready_to_claim_email"
            label="Badge Ready to Claim"
            description="Receive reminder when you have unclaimed badges"
            checked={formState.badge_ready_to_claim_email ?? true}
            onCheckedChange={(checked) => updateField('badge_ready_to_claim_email', checked)}
            disabled={updatePreferences.isPending}
          />
        </CardContent>
      </Card>

      {/* Progress Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Progress Notifications</CardTitle>
          </div>
          <CardDescription>
            Control weekly digest and deadline reminders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PreferenceToggle
            id="weekly_progress_email"
            label="Weekly Progress Digest"
            description="Receive a weekly summary of your progress and activity"
            checked={formState.weekly_progress_email ?? true}
            onCheckedChange={(checked) => updateField('weekly_progress_email', checked)}
            disabled={updatePreferences.isPending}
          />
          <PreferenceToggle
            id="deadline_reminder_email"
            label="Deadline Reminders"
            description="Receive reminders when quest deadlines are approaching"
            checked={formState.deadline_reminder_email ?? true}
            onCheckedChange={(checked) => updateField('deadline_reminder_email', checked)}
            disabled={updatePreferences.isPending}
          />
        </CardContent>
      </Card>

      {/* Save Button and Status */}
      <div className="flex items-center justify-between">
        <div>
          {saveStatus === 'success' && (
            <p className="text-sm text-green-600 flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" />
              Preferences saved successfully
            </p>
          )}
          {saveStatus === 'error' && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              Failed to save preferences. Please try again.
            </p>
          )}
        </div>
        <Button
          onClick={handleSave}
          disabled={!hasChanges || updatePreferences.isPending}
        >
          {updatePreferences.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Save Preferences
        </Button>
      </div>
    </div>
  )
}
