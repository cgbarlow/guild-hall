'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const SETTINGS_TABS = [
  { href: '/settings', label: 'General' },
  { href: '/settings/email', label: 'Email' },
  { href: '/settings/privacy', label: 'Privacy' },
  { href: '/settings/password', label: 'Password' },
  { href: '/settings/export', label: 'Data Export' },
]

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings</p>
      </div>

      <nav className="flex gap-4 border-b">
        {SETTINGS_TABS.map((tab) => {
          const isActive = pathname === tab.href
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'pb-3 text-sm font-medium border-b-2 -mb-px transition-colors',
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/50'
              )}
            >
              {tab.label}
            </Link>
          )
        })}
      </nav>

      <div>{children}</div>
    </div>
  )
}
