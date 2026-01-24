'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Scroll, ClipboardCheck, Clock, Users, FileText } from 'lucide-react'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  {
    href: '/gm/quests',
    label: 'Quests',
    icon: <Scroll className="h-4 w-4" />,
  },
  {
    href: '/gm/review',
    label: 'Review',
    icon: <ClipboardCheck className="h-4 w-4" />,
  },
  {
    href: '/gm/extensions',
    label: 'Extensions',
    icon: <Clock className="h-4 w-4" />,
  },
  {
    href: '/gm/users',
    label: 'Users',
    icon: <Users className="h-4 w-4" />,
  },
  {
    href: '/gm/templates',
    label: 'Templates',
    icon: <FileText className="h-4 w-4" />,
  },
]

export function GMNav() {
  const pathname = usePathname()

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-1 overflow-x-auto py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  'hover:bg-accent hover:text-accent-foreground',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground'
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
