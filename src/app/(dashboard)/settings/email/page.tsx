'use client'

import { useUser } from '@/lib/auth/hooks'
import { EmailPreferencesForm } from '@/components/settings/email-preferences-form'
import { Loader2 } from 'lucide-react'

export default function EmailSettingsPage() {
  const { data: user, isLoading } = useUser()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Please sign in to manage your email preferences.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Email Notifications</h2>
        <p className="text-sm text-muted-foreground">
          Choose which email notifications you want to receive
        </p>
      </div>

      <EmailPreferencesForm userId={user.id} />
    </div>
  )
}
