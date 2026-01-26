'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Ban, KeyRound, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { deleteUser, setUserDisabled, forcePasswordReset } from '@/lib/actions/gm-users'
import type { UserWithRole } from '@/lib/hooks/use-all-users'

interface UserActionsProps {
  user: UserWithRole
  isCurrentUser: boolean
}

type ActionType = 'delete' | 'disable' | 'enable' | 'password-reset' | null

export function UserActions({ user, isCurrentUser }: UserActionsProps) {
  const router = useRouter()
  const [confirmAction, setConfirmAction] = useState<ActionType>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isDisabled = user.is_disabled ?? false
  const forceReset = user.force_password_reset ?? false

  const handleAction = async () => {
    if (!confirmAction) return

    setIsLoading(true)
    setError(null)

    try {
      let result

      switch (confirmAction) {
        case 'delete':
          result = await deleteUser(user.id)
          if (result.success) {
            router.push('/gm/users')
            return
          }
          break

        case 'disable':
          result = await setUserDisabled(user.id, true)
          break

        case 'enable':
          result = await setUserDisabled(user.id, false)
          break

        case 'password-reset':
          result = await forcePasswordReset(user.id)
          break
      }

      if (result) {
        if (result.success) {
          router.refresh()
        } else {
          setError(result.error || result.message)
        }
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
      setConfirmAction(null)
    }
  }

  const getDialogContent = () => {
    switch (confirmAction) {
      case 'delete':
        return {
          title: 'Delete User',
          description: `Are you sure you want to permanently delete "${user.display_name || user.email}"? This action cannot be undone and will remove all their data, including quest progress and achievements.`,
          actionLabel: 'Delete User',
          variant: 'destructive' as const,
        }
      case 'disable':
        return {
          title: 'Disable User Login',
          description: `Are you sure you want to disable logins for "${user.display_name || user.email}"? They will not be able to access their account until re-enabled.`,
          actionLabel: 'Disable Login',
          variant: 'destructive' as const,
        }
      case 'enable':
        return {
          title: 'Enable User Login',
          description: `Re-enable logins for "${user.display_name || user.email}"? They will be able to access their account again.`,
          actionLabel: 'Enable Login',
          variant: 'default' as const,
        }
      case 'password-reset':
        return {
          title: 'Force Password Reset',
          description: `Force "${user.display_name || user.email}" to reset their password on next login attempt? A password reset email will be sent.`,
          actionLabel: 'Force Reset',
          variant: 'default' as const,
        }
      default:
        return {
          title: '',
          description: '',
          actionLabel: '',
          variant: 'default' as const,
        }
    }
  }

  const dialogContent = getDialogContent()

  if (isCurrentUser) {
    return null // Don't show actions for current user
  }

  return (
    <>
      <Card className="border-destructive/50">
        {error && (
          <div className="mx-6 mt-6 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}
        <CardHeader>
          <CardTitle className="text-lg">Account Management</CardTitle>
          <CardDescription>
            Administrative actions for this user account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Account Status */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div>
              <p className="font-medium">Account Status</p>
              <p className="text-sm text-muted-foreground">
                {isDisabled ? 'Logins are currently disabled' : 'Account is active'}
              </p>
            </div>
            {isDisabled ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmAction('enable')}
                disabled={isLoading}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Enable
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmAction('disable')}
                disabled={isLoading}
                className="text-destructive hover:text-destructive"
              >
                <Ban className="mr-2 h-4 w-4" />
                Disable
              </Button>
            )}
          </div>

          {/* Password Reset */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div>
              <p className="font-medium">Password Reset</p>
              <p className="text-sm text-muted-foreground">
                {forceReset
                  ? 'Password reset required on next login'
                  : 'Force user to reset password on next login'}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmAction('password-reset')}
              disabled={isLoading || forceReset}
            >
              <KeyRound className="mr-2 h-4 w-4" />
              {forceReset ? 'Pending' : 'Reset'}
            </Button>
          </div>

          {/* Delete User */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <div>
              <p className="font-medium text-destructive">Delete Account</p>
              <p className="text-sm text-muted-foreground">
                Permanently remove this user and all their data
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setConfirmAction('delete')}
              disabled={isLoading}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmAction !== null} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dialogContent.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {dialogContent.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAction}
              disabled={isLoading}
              className={dialogContent.variant === 'destructive' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {dialogContent.actionLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
