import { GMHeader } from '@/components/layout/gm-header'
import { GMNav } from '@/components/gm/gm-nav'
import { GMSidebar } from '@/components/gm/gm-sidebar'
import { GMAuthGuard } from '@/components/gm/gm-auth-guard'

export default function GMLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <GMAuthGuard>
      <div className="min-h-screen bg-background">
        <GMHeader />
        <GMNav />
        <div className="flex">
          <GMSidebar />
          <main className="flex-1 px-4 py-8 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </GMAuthGuard>
  )
}
