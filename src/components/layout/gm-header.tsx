'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { createClient } from '@/lib/supabase/client'
import { NotificationBell } from '@/components/notifications/notification-bell'

export function GMHeader() {
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="border-b bg-primary/5">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/gm" className="text-xl font-bold">
            Guild Hall
          </Link>
          <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
            GM
          </span>
        </div>

        <nav className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:underline">
            Exit GM
          </Link>
          {user && <NotificationBell />}
          {user && (
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Sign out
            </Button>
          )}
        </nav>
      </div>
    </header>
  )
}
