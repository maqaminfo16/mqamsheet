import { Sidebar } from '@/components/Sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <div className="sidebar" style={{ width: '260px', flexShrink: 0, position: 'fixed', right: 0, top: 0, bottom: 0, zIndex: 10 }}>
        <Sidebar />
      </div>
      <div className="main-content" style={{ flex: 1, marginRight: '260px', display: 'flex', flexDirection: 'column' }}>
        <main style={{ flex: 1, padding: '2rem', overflowX: 'hidden' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
