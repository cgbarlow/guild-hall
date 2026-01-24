import { GMHeader } from '@/components/layout/gm-header'

export default function GMLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <GMHeader />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
