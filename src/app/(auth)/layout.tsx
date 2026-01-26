export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className="min-h-screen h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: 'url(/guild-hall.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="bg-background/40 backdrop-blur-sm rounded-2xl p-6 shadow-2xl">
        {children}
      </div>
    </div>
  )
}
