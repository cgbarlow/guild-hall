'use client'

import { useEffect, createContext, useContext, type ReactNode } from 'react'
import { useNotificationSubscription, requestNotificationPermission } from '@/lib/hooks/use-notification-subscription'
import { useAuth } from '@/contexts/auth-context'

interface NotificationContextType {
  /**
   * Request browser notification permission
   */
  requestPermission: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

interface NotificationProviderProps {
  children: ReactNode
}

/**
 * Provider that manages realtime notification subscriptions
 * Wraps the app to enable notifications across all pages
 */
export function NotificationProvider({ children }: NotificationProviderProps) {
  const { user } = useAuth()

  // Set up realtime subscription when user is authenticated
  useNotificationSubscription()

  // Request notification permission on mount (only for authenticated users)
  useEffect(() => {
    if (user) {
      // Don't auto-request - let user trigger it explicitly
      // This is better UX and respects user choice
    }
  }, [user])

  const value: NotificationContextType = {
    requestPermission: requestNotificationPermission,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

/**
 * Hook to access notification context
 */
export function useNotificationContext() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within NotificationProvider')
  }
  return context
}
