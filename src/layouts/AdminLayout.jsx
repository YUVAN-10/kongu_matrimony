import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '@/components/layout/Navbar'
import Sidebar from '@/components/layout/Sidebar'
import ToastStack from '@/components/layout/ToastStack'
import { NotificationProvider } from '@/context/NotificationContext'

export default function AdminLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  return (
    <NotificationProvider>
      <div className="min-h-screen bg-background">
        <Sidebar open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen} />
        <Navbar onMenuClick={() => setMobileSidebarOpen(true)} />
        <ToastStack />

        <main className="pt-[72px] lg:pl-[260px]">
          <div className="p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </NotificationProvider>
  )
}
