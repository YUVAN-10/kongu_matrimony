import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '@/components/layout/Navbar'
import Sidebar from '@/components/layout/Sidebar'
import ToastStack from '@/components/layout/ToastStack'
import BackButton from '@/components/layout/BackButton'
import { NotificationProvider } from '@/context/NotificationContext'

export default function AdminLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  return (
    <NotificationProvider>
      <div className="min-h-screen bg-background print:bg-white print:min-h-0">
        <div className="print:hidden">
          <Sidebar open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen} />
          <Navbar onMenuClick={() => setMobileSidebarOpen(true)} />
          <ToastStack />
        </div>

        <main className="pt-[72px] lg:pl-[260px] print:p-0 print:pt-0 print:pl-0">
          <div className="p-4 sm:p-6 lg:p-8 print:p-0">
            <div className="print:hidden">
              <BackButton />
            </div>
            <Outlet />
          </div>
        </main>
      </div>
    </NotificationProvider>
  )
}
