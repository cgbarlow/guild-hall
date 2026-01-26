'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { useIsGm } from '@/lib/hooks/use-is-gm'
import { createClient } from '@/lib/supabase/client'
import { NotificationBell } from '@/components/notifications/notification-bell'

export function Header() {
  const { user } = useAuth()
  const { data: isGm } = useIsGm()
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
    <header className="border-b">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3 text-xl">
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

        <nav className="flex items-center gap-4">
          {isGm && (
            <Link href="/gm" className="text-sm hover:underline">
              GM
            </Link>
          )}
          <Link href="/settings/appearance" className="text-sm hover:underline">
            Settings
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
