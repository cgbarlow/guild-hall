'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useDataExport } from '@/lib/hooks/use-data-export'

export function ExportButton() {
  const { exportData, isExporting, error } = useDataExport()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Your Data</CardTitle>
        <CardDescription>
          Download a copy of all your data in JSON format
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          This export includes your profile information, privacy settings, guild memberships, and quest history.
        </p>

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded">
            {error}
          </div>
        )}

        <Button onClick={exportData} disabled={isExporting}>
          {isExporting ? 'Exporting...' : 'Export Data'}
        </Button>
      </CardContent>
    </Card>
  )
}
