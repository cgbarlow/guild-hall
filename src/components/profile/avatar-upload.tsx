'use client'

import { useState, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { uploadAvatar, removeAvatar, type AvatarUploadResult } from '@/lib/actions/avatar'
import { cn } from '@/lib/utils'

interface AvatarUploadProps {
  currentAvatarUrl?: string | null
  displayName?: string | null
  onUploadComplete?: (url: string) => void
  onRemoveComplete?: () => void
}

export function AvatarUpload({
  currentAvatarUrl,
  displayName,
  onUploadComplete,
  onRemoveComplete,
}: AvatarUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      return uploadAvatar(formData)
    },
    onSuccess: (result: AvatarUploadResult) => {
      if (result.success && result.url) {
        setPreviewUrl(null)
        queryClient.invalidateQueries({ queryKey: ['profile'] })
        onUploadComplete?.(result.url)
      } else {
        setError(result.error || 'Upload failed')
      }
    },
    onError: (err: Error) => {
      setError(err.message)
    },
  })

  const removeMutation = useMutation({
    mutationFn: removeAvatar,
    onSuccess: (result: AvatarUploadResult) => {
      if (result.success) {
        setPreviewUrl(null)
        queryClient.invalidateQueries({ queryKey: ['profile'] })
        onRemoveComplete?.()
      } else {
        setError(result.error || 'Remove failed')
      }
    },
    onError: (err: Error) => {
      setError(err.message)
    },
  })

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError(null)

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a JPEG, PNG, GIF, or WebP image.')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File too large. Maximum size is 5MB.')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload
    uploadMutation.mutate(file)
  }

  const handleRemove = () => {
    setError(null)
    removeMutation.mutate()
  }

  const triggerFileSelect = () => {
    fileInputRef.current?.click()
  }

  const initials = displayName
    ? displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?'

  const displayUrl = previewUrl || currentAvatarUrl
  const isLoading = uploadMutation.isPending || removeMutation.isPending

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        {/* Avatar preview */}
        <div className="relative">
          {displayUrl ? (
            <Image
              src={displayUrl}
              alt={displayName || 'Profile avatar'}
              width={96}
              height={96}
              className="w-24 h-24 rounded-full object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-3xl font-semibold">
              {initials}
            </div>
          )}
          {isLoading && (
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={triggerFileSelect}
            disabled={isLoading}
          >
            {uploadMutation.isPending ? 'Uploading...' : 'Upload Photo'}
          </Button>
          {currentAvatarUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              disabled={isLoading}
              className="text-destructive hover:text-destructive"
            >
              {removeMutation.isPending ? 'Removing...' : 'Remove Photo'}
            </Button>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {/* Success message */}
      {uploadMutation.isSuccess && !error && (
        <p className="text-sm text-green-600">Photo uploaded successfully!</p>
      )}
      {removeMutation.isSuccess && !error && (
        <p className="text-sm text-green-600">Photo removed successfully!</p>
      )}

      {/* Help text */}
      <p className="text-xs text-muted-foreground">
        JPEG, PNG, GIF, or WebP. Max 5MB.
      </p>
    </div>
  )
}
