'use client'

import { useEffect } from 'react'

/**
 * Dynamically sets the favicon from environment variable
 * Uses NEXT_PUBLIC_FAVICON_URL if set, otherwise falls back to default
 */
export function DynamicFavicon() {
  useEffect(() => {
    const faviconUrl = process.env.NEXT_PUBLIC_FAVICON_URL

    if (faviconUrl) {
      // Update or create favicon link
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null

      if (!link) {
        link = document.createElement('link')
        link.rel = 'icon'
        document.head.appendChild(link)
      }

      link.href = faviconUrl

      // Also update apple-touch-icon if present
      let appleLink = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement | null
      if (!appleLink) {
        appleLink = document.createElement('link')
        appleLink.rel = 'apple-touch-icon'
        document.head.appendChild(appleLink)
      }
      appleLink.href = faviconUrl
    }
  }, [])

  return null
}
