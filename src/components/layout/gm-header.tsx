'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import {
  Menu,
  Settings,
  X,
  Scroll,
  ClipboardCheck,
  Clock,
  Users,
  FileText,
  LayoutDashboard,
  Sparkles,
  LogOut,
  Home
} from 'lucide-react'
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
import { createClient } from '@/lib/supabase/client'
import { NotificationBell } from '@/components/notifications/notification-bell'
import { cn } from '@/lib/utils'

const sidebarItems = [
  { href: '/gm', label: 'Overview', icon: LayoutDashboard },
  { href: '/gm/quests', label: 'Quests', icon: Scroll },
  { href: '/gm/smart-creator', label: 'Smart Creator', icon: Sparkles },
  { href: '/gm/review', label: 'Review', icon: ClipboardCheck },
  { href: '/gm/extensions', label: 'Extensions', icon: Clock },
  { href: '/gm/users', label: 'Users', icon: Users },
  { href: '/gm/templates', label: 'Templates', icon: FileText },
]

export function GMHeader() {
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
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
                <span className="font-normal text-lg hidden sm:inline">{guildName}</span>
              </>
            )}
          </Link>
          <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
            GM
          </span>
        </div>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-4">
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

        {/* Mobile navigation */}
        <div className="flex md:hidden items-center gap-2">
          {/* Gear menu for Exit GM/Notifications/Sign out */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                  <Settings className="h-5 w-5" />
                  <span className="sr-only">Settings menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="cursor-pointer flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Exit GM
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings/privacy" className="cursor-pointer flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Hamburger menu for GM navigation */}
          <DropdownMenu open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
                <span className="sr-only">GM menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {sidebarItems.map((item) => {
                const Icon = item.icon
                const isActive = item.href === '/gm'
                  ? pathname === '/gm'
                  : pathname === item.href || pathname.startsWith(`${item.href}/`)

                return (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        "cursor-pointer flex items-center gap-2",
                        isActive && "bg-accent"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
