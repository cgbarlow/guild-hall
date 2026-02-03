import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Clock, Mail } from 'lucide-react'

interface AuthErrorPageProps {
  searchParams: Promise<{ message?: string; error?: string; error_code?: string }>
}

// Check if the error is related to expired tokens
function isTokenExpiredError(message?: string, error?: string, errorCode?: string): boolean {
  const expiredPatterns = [
    'token',
    'expired',
    'otp',
    'invalid_otp',
    'otp_expired',
    'token_expired',
    'link expired',
    'verification link',
  ]

  const combinedText = `${message || ''} ${error || ''} ${errorCode || ''}`.toLowerCase()
  return expiredPatterns.some(pattern => combinedText.includes(pattern))
}

export default async function AuthErrorPage({ searchParams }: AuthErrorPageProps) {
  const params = await searchParams
  const isExpired = isTokenExpiredError(params.message, params.error, params.error_code)

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {isExpired ? (
            <>
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
                <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <CardTitle>Verification Link Expired</CardTitle>
              <CardDescription>
                Your email verification link has expired. Don&apos;t worry - you can request a new one.
              </CardDescription>
            </>
          ) : (
            <>
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-destructive">Authentication Error</CardTitle>
              <CardDescription>
                Something went wrong during authentication.
              </CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {params.message && !isExpired && (
            <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
              {params.message}
            </p>
          )}

          {isExpired ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Verification links expire after a short time for security. You can:
              </p>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li>Request a new verification email below</li>
                <li>Try signing up again with the same email</li>
              </ul>
              <div className="flex flex-col gap-2 pt-2">
                <Button asChild>
                  <Link href="/auth/resend">
                    <Mail className="mr-2 h-4 w-4" />
                    Resend Verification Email
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/login">Back to Login</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button asChild>
                <Link href="/login">Try Again</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">Go Home</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
