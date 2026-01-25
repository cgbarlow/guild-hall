'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Scroll,
  ClipboardCheck,
  Clock,
  Users,
  FileText,
  LayoutDashboard,
  Sparkles
} from 'lucide-react'

interface SidebarItem {
  href: string
  label: string
  icon: React.ReactNode
  badge?: string
}

const sidebarItems: SidebarItem[] = [
  {
    href: '/gm',
    label: 'Overview',
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    href: '/gm/quests',
    label: 'Quests',
    icon: <Scroll className="h-5 w-5" />,
  },
  {
    href: '/gm/smart-creator',
    label: 'Smart Creator',
    icon: <Sparkles className="h-5 w-5" />,
    badge: 'Soon',
  },
  {
    href: '/gm/review',
    label: 'Review',
    icon: <ClipboardCheck className="h-5 w-5" />,
  },
  {
    href: '/gm/extensions',
    label: 'Extensions',
    icon: <Clock className="h-5 w-5" />,
  },
  {
    href: '/gm/users',
    label: 'Users',
    icon: <Users className="h-5 w-5" />,
  },
  {
    href: '/gm/templates',
    label: 'Templates',
    icon: <FileText className="h-5 w-5" />,
  },
]

export function GMSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-muted/30 lg:block">
      <nav className="flex flex-col gap-1 p-4">
        {sidebarItems.map((item) => {
          // Handle exact match for overview, prefix match for others
          const isActive = item.href === '/gm'
            ? pathname === '/gm'
            : pathname === item.href || pathname.startsWith(`${item.href}/`)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground'
              )}
            >
              <span className="flex items-center gap-3">
                {item.icon}
                {item.label}
              </span>
              {item.badge && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
