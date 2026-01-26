'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  currentImageUrl?: string | null
  onUpload: (file: File) => Promise<{ success: boolean; url?: string; error?: string }>
  onRemove?: () => Promise<{ success: boolean; error?: string }>
  className?: string
  imageClassName?: string
  placeholderIcon?: React.ReactNode
  placeholderText?: string
  aspectRatio?: 'square' | 'video' | 'auto'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}

const sizeClasses = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-32 h-32',
}

const aspectClasses = {
  square: 'aspect-square',
  video: 'aspect-video',
  auto: '',
}

export function ImageUpload({
  currentImageUrl,
  onUpload,
  onRemove,
  className,
  imageClassName,
  placeholderIcon,
  placeholderText = 'Upload',
  aspectRatio = 'square',
  size = 'md',
  disabled = false,
}: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const [showActions, setShowActions] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
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

    // Show preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload
    setIsUploading(true)
    try {
      const result = await onUpload(file)
      if (result.success) {
        setPreviewUrl(null)
        setShowActions(false)
      } else {
        setError(result.error || 'Upload failed')
        setPreviewUrl(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      setPreviewUrl(null)
    } finally {
      setIsUploading(false)
      // Reset input so same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemove = async () => {
    if (!onRemove) return

    setError(null)
    setIsRemoving(true)
    try {
      const result = await onRemove()
      if (result.success) {
        setPreviewUrl(null)
        setShowActions(false)
      } else {
        setError(result.error || 'Remove failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Remove failed')
    } finally {
      setIsRemoving(false)
    }
  }

  const triggerFileSelect = () => {
    fileInputRef.current?.click()
  }

  const displayUrl = previewUrl || currentImageUrl
  const isLoading = isUploading || isRemoving

  return (
    <div className={cn('relative', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isLoading}
      />

      <div
        className={cn(
          'relative cursor-pointer border-2 border-dashed rounded-lg overflow-hidden transition-colors',
          'hover:border-primary/50 hover:bg-muted/50',
          displayUrl && 'border-solid border-muted',
          disabled && 'opacity-50 cursor-not-allowed',
          sizeClasses[size],
          aspectClasses[aspectRatio],
          imageClassName
        )}
        onClick={() => !disabled && setShowActions(!showActions)}
      >
        {displayUrl ? (
          <Image
            src={displayUrl}
            alt="Uploaded image"
            fill
            className="object-contain"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
            {placeholderIcon || (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
            )}
            <span className="text-xs mt-1">{placeholderText}</span>
          </div>
        )}

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
          </div>
        )}
      </div>

      {/* Dropdown actions */}
      {showActions && !isLoading && !disabled && (
        <div className="absolute top-full left-0 mt-2 bg-background border rounded-md shadow-lg z-10 min-w-[120px]">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              triggerFileSelect()
              setShowActions(false)
            }}
            className="w-full px-3 py-2 text-sm text-left hover:bg-muted transition-colors"
          >
            {currentImageUrl ? 'Replace' : 'Upload'}
          </button>
          {currentImageUrl && onRemove && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleRemove()
              }}
              className="w-full px-3 py-2 text-sm text-left text-destructive hover:bg-muted transition-colors"
            >
              Remove
            </button>
          )}
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="absolute top-full left-0 mt-1 text-xs text-destructive max-w-[200px]">
          {error}
        </p>
      )}
    </div>
  )
}
