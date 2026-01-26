'use client'

import { createContext, useContext, useCallback, useEffect, useState, type ReactNode } from 'react'

export type Theme = 'light' | 'warm' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'warm' | 'dark'

interface ThemeContextValue {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

const STORAGE_KEY = 'guild-hall-theme'

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyThemeClass(theme: ResolvedTheme) {
  const root = document.documentElement
  root.classList.remove('light', 'warm', 'dark')
  root.classList.add(theme)
}

interface ThemeProviderProps {
  children: ReactNode
  defaultTheme?: Theme
}

function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme === 'system') {
    return getSystemTheme()
  }
  return theme
}

export function ThemeProvider({ children, defaultTheme = 'warm' }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme)
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('warm')
  const [mounted, setMounted] = useState(false)

  // Initialize theme from localStorage on mount
  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
    const initialTheme = stored || defaultTheme
    setThemeState(initialTheme)

    const resolved = resolveTheme(initialTheme)
    setResolvedTheme(resolved)
    applyThemeClass(resolved)
  }, [defaultTheme])

  // Listen for system preference changes
  useEffect(() => {
    if (!mounted) return

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
  }, [theme, mounted])

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem(STORAGE_KEY, newTheme)

    const resolved = resolveTheme(newTheme)
    setResolvedTheme(resolved)
    applyThemeClass(resolved)
  }, [])

  // Prevent flash by not rendering until mounted
  // The children will still render but theme won't be applied yet
  const value: ThemeContextValue = {
    theme,
    resolvedTheme,
    setTheme,
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
