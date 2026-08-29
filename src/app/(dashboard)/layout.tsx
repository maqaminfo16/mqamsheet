import React, { Suspense } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { MobileTopbar } from '@/components/MobileTopbar'
import { TopProgressBar } from '@/components/ui/Loading'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Suspense fallback={null}>
        <TopProgressBar />
      </Suspense>
      <Sidebar />
      <div className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <MobileTopbar />
        <main className="main-wrapper" style={{ flex: 1, padding: '2rem', overflowX: 'hidden' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
