'use client'

import { ThemeToggle } from '@/components/settings/theme-toggle'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AppearanceSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Appearance</h1>
        <p className="text-muted-foreground">
          Customize the appearance of the app. Choose your preferred theme.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <CardDescription>
            Select your preferred color scheme. Choose &quot;System&quot; to automatically
            match your device settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ThemeToggle />
        </CardContent>
      </Card>
    </div>
  )
}
