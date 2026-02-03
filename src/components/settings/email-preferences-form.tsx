'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Mail, Bell, Trophy, Target, Calendar, CheckCircle2, AlertCircle, Clock, Globe, BellOff } from 'lucide-react'
import { useUserEmailPreferences, useUpdateUserEmailPreferences } from '@/lib/hooks/use-user-email-preferences'
import { useUserWeeklyEmailPrefs, useUpdateUserWeeklyEmailPrefs } from '@/lib/hooks/use-user-weekly-email-prefs'
import { DAYS_OF_WEEK } from '@/lib/types/engagement'
import type { UserEmailPreferences } from '@/lib/types/engagement'

const TIMEZONES = [
  'Pacific/Auckland', 'Pacific/Fiji', 'Pacific/Honolulu',
  'Australia/Sydney', 'Australia/Melbourne', 'Australia/Brisbane', 'Australia/Perth', 'Australia/Adelaide',
  'Asia/Singapore', 'Asia/Hong_Kong', 'Asia/Tokyo', 'Asia/Seoul', 'Asia/Shanghai', 'Asia/Kolkata', 'Asia/Dubai',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Amsterdam',
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'America/Toronto', 'America/Vancouver',
]

const HOURS = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`)

function getUserTimezone(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    return TIMEZONES.includes(tz) ? tz : 'Pacific/Auckland'
  } catch {
    return 'Pacific/Auckland'
  }
}

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
    <div className={`flex items-center justify-between py-3 border-b last:border-0 ${disabled ? 'opacity-50' : ''}`}>
      <div className="space-y-0.5 pr-4">
        <Label htmlFor={id} className={`text-sm font-medium ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
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
  const { data: preferences, isLoading: loadingPrefs } = useUserEmailPreferences(userId)
  const { data: weeklyPrefs, isLoading: loadingWeekly } = useUserWeeklyEmailPrefs(userId)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const updatePreferences = useUpdateUserEmailPreferences()
  const updateWeeklyPrefs = useUpdateUserWeeklyEmailPrefs()

  // Local state for notification preferences
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

  // Local state for weekly email scheduling
  const [weeklyForm, setWeeklyForm] = useState({
    enabled: true,
    day_of_week: 1,
    send_time: '08:00',
    timezone: getUserTimezone(),
  })

  // Unsubscribe all state
  const [unsubscribeAll, setUnsubscribeAll] = useState(false)

  const [hasChanges, setHasChanges] = useState(false)
  const [hasWeeklyChanges, setHasWeeklyChanges] = useState(false)

  // Check if all emails are disabled to set unsubscribe all
  const checkAllDisabled = (prefs: Partial<UserEmailPreferences>, weeklyEnabled: boolean) => {
    return !weeklyEnabled &&
      !prefs.quest_accepted_email &&
      !prefs.quest_completed_email &&
      !prefs.objective_submitted_email &&
      !prefs.objective_approved_email &&
      !prefs.objective_rejected_email &&
      !prefs.badge_earned_email &&
      !prefs.badge_ready_to_claim_email &&
      !prefs.deadline_reminder_email
  }

  // Sync form state when preferences load
  useEffect(() => {
    if (preferences) {
      const newFormState = {
        quest_accepted_email: preferences.quest_accepted_email,
        quest_completed_email: preferences.quest_completed_email,
        objective_submitted_email: preferences.objective_submitted_email,
        objective_approved_email: preferences.objective_approved_email,
        objective_rejected_email: preferences.objective_rejected_email,
        badge_earned_email: preferences.badge_earned_email,
        badge_ready_to_claim_email: preferences.badge_ready_to_claim_email,
        weekly_progress_email: preferences.weekly_progress_email,
        deadline_reminder_email: preferences.deadline_reminder_email,
      }
      setFormState(newFormState)
      setHasChanges(false)
    }
  }, [preferences])

  // Sync weekly prefs when they load
  useEffect(() => {
    if (weeklyPrefs) {
      setWeeklyForm({
        enabled: weeklyPrefs.enabled,
        day_of_week: weeklyPrefs.day_of_week,
        send_time: weeklyPrefs.send_time,
        timezone: weeklyPrefs.timezone,
      })
      setHasWeeklyChanges(false)
    }
  }, [weeklyPrefs])

  // Update unsubscribe all state when prefs change
  useEffect(() => {
    if (preferences && weeklyPrefs) {
      setUnsubscribeAll(checkAllDisabled(formState, weeklyForm.enabled))
    }
  }, [preferences, weeklyPrefs, formState, weeklyForm.enabled])

  const updateField = (field: keyof UserEmailPreferences, value: boolean) => {
    setFormState((prev) => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }

  const handleUnsubscribeAllChange = (checked: boolean) => {
    setUnsubscribeAll(checked)
    if (checked) {
      // Disable all email preferences
      setFormState({
        quest_accepted_email: false,
        quest_completed_email: false,
        objective_submitted_email: false,
        objective_approved_email: false,
        objective_rejected_email: false,
        badge_earned_email: false,
        badge_ready_to_claim_email: false,
        weekly_progress_email: false,
        deadline_reminder_email: false,
      })
      setWeeklyForm(prev => ({ ...prev, enabled: false }))
      setHasChanges(true)
      setHasWeeklyChanges(true)
    }
  }

  const handleSave = async () => {
    setSaveStatus('idle')
    try {
      // Save notification preferences
      await updatePreferences.mutateAsync({
        user_id: userId,
        ...formState,
      })

      // Save weekly email preferences
      await updateWeeklyPrefs.mutateAsync({
        user_id: userId,
        ...weeklyForm,
      })

      setHasChanges(false)
      setHasWeeklyChanges(false)
      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 5000)
    }
  }

  const isLoading = loadingPrefs || loadingWeekly
  const isSaving = updatePreferences.isPending || updateWeeklyPrefs.isPending
  const allTogglesDisabled = isSaving || unsubscribeAll

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
      <Card className={unsubscribeAll ? 'opacity-60' : ''}>
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
            disabled={allTogglesDisabled}
          />
          <PreferenceToggle
            id="quest_completed_email"
            label="Quest Completed"
            description="Receive notification when you complete a quest"
            checked={formState.quest_completed_email ?? true}
            onCheckedChange={(checked) => updateField('quest_completed_email', checked)}
            disabled={allTogglesDisabled}
          />
        </CardContent>
      </Card>

      {/* Objective Notifications */}
      <Card className={unsubscribeAll ? 'opacity-60' : ''}>
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
            disabled={allTogglesDisabled}
          />
          <PreferenceToggle
            id="objective_approved_email"
            label="Objective Approved"
            description="Receive notification when your objective is approved by a GM"
            checked={formState.objective_approved_email ?? true}
            onCheckedChange={(checked) => updateField('objective_approved_email', checked)}
            disabled={allTogglesDisabled}
          />
          <PreferenceToggle
            id="objective_rejected_email"
            label="Objective Needs Revision"
            description="Receive notification when your objective needs revision"
            checked={formState.objective_rejected_email ?? true}
            onCheckedChange={(checked) => updateField('objective_rejected_email', checked)}
            disabled={allTogglesDisabled}
          />
        </CardContent>
      </Card>

      {/* Achievement Notifications */}
      <Card className={unsubscribeAll ? 'opacity-60' : ''}>
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
            disabled={allTogglesDisabled}
          />
          <PreferenceToggle
            id="badge_ready_to_claim_email"
            label="Badge Ready to Claim"
            description="Receive reminder when you have unclaimed badges"
            checked={formState.badge_ready_to_claim_email ?? true}
            onCheckedChange={(checked) => updateField('badge_ready_to_claim_email', checked)}
            disabled={allTogglesDisabled}
          />
        </CardContent>
      </Card>

      {/* Weekly Progress Email */}
      <Card className={unsubscribeAll ? 'opacity-60' : ''}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Weekly Progress Email</CardTitle>
          </div>
          <CardDescription>
            Receive a weekly summary of your progress, next steps, and encouragement
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="weekly-enabled">Enable Weekly Email</Label>
              <p className="text-sm text-muted-foreground">
                Receive progress summaries each week
              </p>
            </div>
            <Switch
              id="weekly-enabled"
              checked={weeklyForm.enabled}
              onCheckedChange={(checked) => {
                setWeeklyForm(prev => ({ ...prev, enabled: checked }))
                setHasWeeklyChanges(true)
              }}
              disabled={allTogglesDisabled}
            />
          </div>

          {weeklyForm.enabled && !unsubscribeAll && (
            <>
              <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                Emails will be sent every <strong>{DAYS_OF_WEEK.find(d => d.value === weeklyForm.day_of_week)?.label}</strong> at{' '}
                <strong>{weeklyForm.send_time}</strong> ({weeklyForm.timezone.replace(/_/g, ' ')})
              </p>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="day-of-week" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Day of Week
                  </Label>
                  <Select
                    value={weeklyForm.day_of_week.toString()}
                    onValueChange={(value) => {
                      setWeeklyForm(prev => ({ ...prev, day_of_week: parseInt(value) }))
                      setHasWeeklyChanges(true)
                    }}
                    disabled={isSaving}
                  >
                    <SelectTrigger id="day-of-week">
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS_OF_WEEK.map(day => (
                        <SelectItem key={day.value} value={day.value.toString()}>
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="send-time" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Preferred Time
                  </Label>
                  <Select
                    value={weeklyForm.send_time}
                    onValueChange={(value) => {
                      setWeeklyForm(prev => ({ ...prev, send_time: value }))
                      setHasWeeklyChanges(true)
                    }}
                    disabled={isSaving}
                  >
                    <SelectTrigger id="send-time">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {HOURS.map(hour => (
                        <SelectItem key={hour} value={hour}>{hour}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Timezone
                  </Label>
                  <Select
                    value={weeklyForm.timezone}
                    onValueChange={(value) => {
                      setWeeklyForm(prev => ({ ...prev, timezone: value }))
                      setHasWeeklyChanges(true)
                    }}
                    disabled={isSaving}
                  >
                    <SelectTrigger id="timezone">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMEZONES.map(tz => (
                        <SelectItem key={tz} value={tz}>{tz.replace(/_/g, ' ')}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Deadline Reminders */}
      <Card className={unsubscribeAll ? 'opacity-60' : ''}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Deadline Reminders</CardTitle>
          </div>
          <CardDescription>
            Control reminder emails for approaching deadlines
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PreferenceToggle
            id="deadline_reminder_email"
            label="Quest Deadline Reminders"
            description="Receive reminders when quest deadlines are approaching"
            checked={formState.deadline_reminder_email ?? true}
            onCheckedChange={(checked) => updateField('deadline_reminder_email', checked)}
            disabled={allTogglesDisabled}
          />
        </CardContent>
      </Card>

      {/* Unsubscribe All */}
      <Card className="border-destructive/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <BellOff className="h-5 w-5 text-destructive" />
            <CardTitle className="text-lg">Unsubscribe from All Emails</CardTitle>
          </div>
          <CardDescription>
            Disable all email notifications from Guild Hall
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between py-3">
            <div className="space-y-0.5 pr-4">
              <Label htmlFor="unsubscribe-all" className="text-sm font-medium cursor-pointer">
                Unsubscribe All
              </Label>
              <p className="text-sm text-muted-foreground">
                Turn off all email notifications. You can still enable individual notifications later.
              </p>
            </div>
            <Switch
              id="unsubscribe-all"
              checked={unsubscribeAll}
              onCheckedChange={handleUnsubscribeAllChange}
              disabled={isSaving}
            />
          </div>
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
          disabled={(!hasChanges && !hasWeeklyChanges) || isSaving}
        >
          {isSaving && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Save Preferences
        </Button>
      </div>
    </div>
  )
}
