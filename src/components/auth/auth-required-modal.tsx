'use client'

import Link from 'next/link'
import { LogIn, UserPlus } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

interface AuthRequiredModalProps {
  /** Whether the modal is open */
  open: boolean
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void
  /** Modal title */
  title?: string
  /** Modal description */
  description?: string
  /** URL to redirect to after authentication */
  returnUrl: string
}

/**
 * Modal shown when an unauthenticated user attempts a protected action.
 * Provides options to sign in or create an account with returnUrl support.
 */
export function AuthRequiredModal({
  open,
  onOpenChange,
  title = 'Sign in to continue',
  description = 'You need to be signed in to perform this action.',
  returnUrl,
}: AuthRequiredModalProps) {
  const encodedReturnUrl = encodeURIComponent(returnUrl)

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <LogIn className="h-5 w-5" />
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button asChild>
            <Link href={`/login?returnUrl=${encodedReturnUrl}`}>
              <LogIn className="h-4 w-4 mr-2" />
              Sign In
            </Link>
          </Button>
        </AlertDialogFooter>

        <div className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link
            href={`/register?returnUrl=${encodedReturnUrl}`}
            className="text-primary font-medium hover:underline inline-flex items-center gap-1"
          >
            <UserPlus className="h-3 w-3" />
            Create one
          </Link>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
