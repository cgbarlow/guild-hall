import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div
      className="min-h-screen h-screen flex flex-col items-center justify-center p-4"
      style={{
        backgroundImage: 'url(/guild-hall.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="bg-background/40 backdrop-blur-sm rounded-2xl p-8 shadow-2xl">
        <div className="text-center space-y-6 max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Guild Hall
          </h1>
          <p className="text-xl text-foreground font-medium">
            Quest-based engagement platform for gamified learning and achievement
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
    </div>
  )
}
