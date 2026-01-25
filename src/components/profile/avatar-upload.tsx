'use client'

import { useState, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { uploadAvatar, removeAvatar, type AvatarUploadResult } from '@/lib/actions/avatar'

interface AvatarUploadProps {
  currentAvatarUrl?: string | null
  displayName?: string | null
  onUploadComplete?: (url: string) => void
  onRemoveComplete?: () => void
  compact?: boolean
}

export function AvatarUpload({
  currentAvatarUrl,
  displayName,
  onUploadComplete,
  onRemoveComplete,
  compact = false,
}: AvatarUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showActions, setShowActions] = useState(false)
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
        setShowActions(false)
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
        setShowActions(false)
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

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a JPEG, PNG, GIF, or WebP image.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File too large. Maximum size is 5MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)

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

  // Compact mode: avatar with edit overlay
  if (compact) {
    return (
      <div className="relative group">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Avatar */}
        <div
          className="relative cursor-pointer"
          onClick={() => setShowActions(!showActions)}
        >
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

          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
            </div>
          )}

          {/* Edit overlay (on hover) */}
          {!isLoading && (
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </div>
          )}
        </div>

        {/* Dropdown actions */}
        {showActions && !isLoading && (
          <div className="absolute top-full left-0 mt-2 bg-background border rounded-md shadow-lg z-10 min-w-[140px]">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                triggerFileSelect()
              }}
              className="w-full px-3 py-2 text-sm text-left hover:bg-muted transition-colors"
            >
              Upload Photo
            </button>
            {currentAvatarUrl && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemove()
                }}
                className="w-full px-3 py-2 text-sm text-left text-destructive hover:bg-muted transition-colors"
              >
                Remove Photo
              </button>
            )}
          </div>
        )}

        {/* Error tooltip */}
        {error && (
          <div className="absolute top-full left-0 mt-2 p-2 bg-destructive text-destructive-foreground text-xs rounded max-w-[200px]">
            {error}
          </div>
        )}
      </div>
    )
  }

  // Full mode: avatar with side buttons
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
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

      {error && <p className="text-sm text-destructive">{error}</p>}

      {uploadMutation.isSuccess && !error && (
        <p className="text-sm text-green-600">Photo uploaded successfully!</p>
      )}
      {removeMutation.isSuccess && !error && (
        <p className="text-sm text-green-600">Photo removed successfully!</p>
      )}

      <p className="text-xs text-muted-foreground">
        JPEG, PNG, GIF, or WebP. Max 5MB.
      </p>
    </div>
  )
}
