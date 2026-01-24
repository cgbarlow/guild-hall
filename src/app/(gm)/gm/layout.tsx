import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function GMLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-primary/5">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/gm" className="text-xl font-bold">
              Guild Hall
            </Link>
            <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
              GM
            </span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/gm" className="text-sm hover:text-primary">
              Overview
            </Link>
            <Link href="/gm/quests" className="text-sm hover:text-primary">
              Quests
            </Link>
            <Link href="/gm/review" className="text-sm hover:text-primary">
              Review
            </Link>
            <Link href="/gm/users" className="text-sm hover:text-primary">
              Users
            </Link>
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-primary">
              Exit GM
            </Link>
            <span className="text-sm text-muted-foreground">
              {user?.email}
            </span>
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
