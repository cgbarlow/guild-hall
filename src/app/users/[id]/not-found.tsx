import Link from 'next/link'
import { UserX, ArrowLeft, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

/**
 * 404 page for user profiles
 * Shown when:
 * - User does not exist
 * - User has profile_visibility set to false
 * - Database error occurs
 */
export default function ProfileNotFound() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <UserX className="h-10 w-10 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">Profile Not Found</CardTitle>
          <CardDescription>
            This adventurer&apos;s profile is not available. They may have set their
            profile to private or the profile does not exist.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button variant="outline" asChild>
            <Link href="javascript:history.back()">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Link>
          </Button>
          <Button asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Home
            </Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
