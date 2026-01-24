import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface AuthErrorPageProps {
  searchParams: Promise<{ message?: string }>
}

export default async function AuthErrorPage({ searchParams }: AuthErrorPageProps) {
  const params = await searchParams

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-destructive">Authentication Error</CardTitle>
          <CardDescription>
            Something went wrong during authentication.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {params.message && (
            <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
              {params.message}
            </p>
          )}
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/login">Try Again</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">Go Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
