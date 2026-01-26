'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { createClient } from '@/lib/supabase/client'
import { NotificationBell } from '@/components/notifications/notification-bell'

export function GMHeader() {
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const logoUrl = process.env.NEXT_PUBLIC_GUILD_LOGO_URL
  const guildName = process.env.NEXT_PUBLIC_GUILD_NAME

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="border-b bg-primary/5">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/gm" className="flex items-center gap-3 text-xl">
            <span className="font-bold">Guild Hall</span>
            {guildName && (
              <>
                {logoUrl && (
                  <Image
                    src={logoUrl}
                    alt="Guild Logo"
                    width={32}
                    height={32}
                    className="h-8 w-8 object-contain"
                  />
                )}
                <span className="font-normal text-lg">{guildName}</span>
              </>
            )}
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
