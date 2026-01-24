import Link from 'next/link'

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings</p>
      </div>

      <nav className="flex gap-4 border-b pb-4">
        <Link
          href="/settings/privacy"
          className="text-sm font-medium hover:text-primary"
        >
          Privacy
        </Link>
        <Link
          href="/settings/export"
          className="text-sm font-medium hover:text-primary"
        >
          Data Export
        </Link>
      </nav>

      <div>{children}</div>
    </div>
  )
}
