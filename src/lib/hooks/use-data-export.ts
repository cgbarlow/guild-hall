'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { downloadJson } from '@/lib/utils/download'

export function useDataExport() {
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const exportData = async () => {
    setIsExporting(true)
    setError(null)

    try {
      const supabase = createClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error: rpcError } = await supabase.rpc('export_user_data')
      
      if (rpcError) throw new Error(rpcError.message)

      const timestamp = new Date().toISOString().split('T')[0]
      downloadJson(data, `user-data-export-${timestamp}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export data')
    } finally {
      setIsExporting(false)
    }
  }

  return { exportData, isExporting, error }
}
