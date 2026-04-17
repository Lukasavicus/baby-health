import { Outlet, useNavigate } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { FloatingAction } from './FloatingAction'
import { useState } from 'react'
import { QuickLogSheet } from '../sheets/QuickLogSheet'

export default function Layout() {
  const [showQuickLog, setShowQuickLog] = useState(false)

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto relative">
      <main className="flex-1 pb-24 overflow-y-auto">
        <Outlet />
      </main>

      <FloatingAction onClick={() => setShowQuickLog(true)} />
      <BottomNav />

      <QuickLogSheet isOpen={showQuickLog} onClose={() => setShowQuickLog(false)} />
    </div>
  )
}
