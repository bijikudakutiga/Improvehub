import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import TopBar from './TopBar.jsx'
import InstallPrompt from './InstallPrompt.jsx'
import Tutorial from './Tutorial.jsx'
import { useTutorial } from '../contexts/TutorialContext.jsx'

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { spotlight } = useTutorial()

  // Otomatis buka sidebar di HP saat tutorial sedang menyorot salah satu menu
  useEffect(() => {
    if (spotlight && spotlight.startsWith('menu-')) setMobileOpen(true)
  }, [spotlight])

  return (
    <div className="flex h-screen bg-tint">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} spotlight={spotlight} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar onOpenMenu={() => setMobileOpen(true)} spotlight={spotlight} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-5 sm:px-6 sm:py-6">
          <div className="animate-fadeIn">
            <Outlet />
          </div>
        </main>
      </div>
      <InstallPrompt />
      <Tutorial />
    </div>
  )
}
