import { Header } from '@/components/layout/header'
import { UserSidebar } from '@/components/layout/user-sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <UserSidebar />
        <main className="flex-1 px-4 py-8 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  )
}
