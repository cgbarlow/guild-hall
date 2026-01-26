'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Menu, Settings, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/contexts/auth-context'
import { useIsGm } from '@/lib/hooks/use-is-gm'
import { createClient } from '@/lib/supabase/client'
import { NotificationBell } from '@/components/notifications/notification-bell'

export function Header() {
  const { user } = useAuth()
  const { data: isGm } = useIsGm()
  const router = useRouter()
  const supabase = createClient()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
              <span className="font-normal text-lg hidden sm:inline">{guildName}</span>
            </>
          )}
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-4">
          {isGm && (
            <Link href="/gm" className="text-sm hover:underline">
              GM
            </Link>
          )}
          <Link href="/settings/privacy" className="text-sm hover:underline">
            Settings
          </Link>
          {user && <NotificationBell />}
          {user && (
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Sign out
            </Button>
          )}
        </nav>

        {/* Mobile navigation */}
        <div className="flex md:hidden items-center gap-2">
          {/* Gear menu for GM/Settings/Notifications */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                  <Settings className="h-5 w-5" />
                  <span className="sr-only">Settings menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {isGm && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/gm" className="cursor-pointer">
                        GM Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/settings/privacy" className="cursor-pointer">
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/notifications" className="cursor-pointer">
                    Notifications
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Hamburger menu for main navigation */}
          <DropdownMenu open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
                <span className="sr-only">Main menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href="/dashboard" className="cursor-pointer">
                  Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/quests" className="cursor-pointer">
                  Quests
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/my-quests" className="cursor-pointer">
                  My Quests
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/leaderboard" className="cursor-pointer">
                  Leaderboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/profile" className="cursor-pointer">
                  Profile
                </Link>
              </DropdownMenuItem>
              {user && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    Sign out
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
