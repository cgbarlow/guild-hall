'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Scroll,
  Map,
  User,
  Trophy,
} from 'lucide-react'

interface SidebarItem {
  href: string
  label: string
  icon: React.ReactNode
}

const sidebarItems: SidebarItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    href: '/my-quests',
    label: 'My Quests',
    icon: <Scroll className="h-5 w-5" />,
  },
  {
    href: '/quests',
    label: 'Bounty Board',
    icon: <Map className="h-5 w-5" />,
  },
  {
    href: '/leaderboard',
    label: 'Leaderboard',
    icon: <Trophy className="h-5 w-5" />,
  },
  {
    href: '/profile',
    label: 'Profile',
    icon: <User className="h-5 w-5" />,
  },
]

export function UserSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-muted/30 lg:block">
      <nav className="flex flex-col gap-1 p-4">
        {sidebarItems.map((item) => {
          const isActive = item.href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname === item.href || pathname.startsWith(`${item.href}/`)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground'
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
