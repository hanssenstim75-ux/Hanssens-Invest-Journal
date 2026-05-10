import { useState } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Sidebar from './Sidebar'

export default function Layout() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)

  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="flex h-full min-h-screen w-full bg-bg">
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar — drawer on mobile, static on desktop */}
      <div className={`fixed inset-y-0 left-0 z-50 transition-transform duration-200 lg:static lg:translate-x-0 lg:z-auto ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar onClose={() => setOpen(false)} />
      </div>

      {/* Main */}
      <div className="flex flex-col flex-1 min-w-0 w-full">
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-card border-b border-border sticky top-0 z-30">
          <button onClick={() => setOpen(true)} className="text-muted hover:text-white transition-colors">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 border border-border-light flex items-center justify-center">
              <span className="brand-title text-xs text-white leading-none">H</span>
            </div>
            <p className="brand-title text-sm tracking-widest text-white">HANSSENS</p>
          </div>
        </header>

        <main className="flex-1 overflow-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
