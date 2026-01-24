import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="text-center space-y-6 max-w-2xl px-4">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Guild Hall
        </h1>
        <p className="text-xl text-muted-foreground">
          Quest-based engagement platform for gamified learning and achievement.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/login">Sign In</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/register">Create Account</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
