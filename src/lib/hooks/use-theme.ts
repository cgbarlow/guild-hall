'use client'

import { useCallback, useEffect, useState } from 'react'

export type Theme = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'guild-hall-theme'

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyThemeClass(theme: 'light' | 'dark') {
  const root = document.documentElement
  root.classList.remove('light', 'dark')
  root.classList.add(theme)
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme | undefined>(undefined)
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')

  // Initialize theme from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
    const initialTheme = stored || 'system'
    setThemeState(initialTheme)

    const resolved = initialTheme === 'system' ? getSystemTheme() : initialTheme
    setResolvedTheme(resolved)
    applyThemeClass(resolved)
  }, [])

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        const newTheme = e.matches ? 'dark' : 'light'
        setResolvedTheme(newTheme)
        applyThemeClass(newTheme)
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem(STORAGE_KEY, newTheme)

    const resolved = newTheme === 'system' ? getSystemTheme() : newTheme
    setResolvedTheme(resolved)
    applyThemeClass(resolved)
  }, [])

  return {
    theme: theme ?? 'system',
    resolvedTheme,
    setTheme,
  }
}
