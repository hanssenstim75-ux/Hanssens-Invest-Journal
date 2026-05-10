import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, BookOpen, PlusCircle, BarChart2, CalendarDays, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const nav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/trades', label: 'Trade Log', icon: BookOpen },
  { to: '/add', label: 'Nieuwe Trade', icon: PlusCircle },
  { to: '/calendar', label: 'Kalender', icon: CalendarDays },
  { to: '/analytics', label: 'Analyse', icon: BarChart2 },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="w-56 min-h-screen bg-card border-r border-border flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="px-5 pt-6 pb-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border border-border-light flex items-center justify-center flex-shrink-0">
            <span className="brand-title text-base text-white leading-none">H</span>
          </div>
          <div>
            <p className="brand-title text-sm tracking-widest text-white leading-tight">HANSSENS</p>
            <p className="label-caps text-[0.55rem] text-faint tracking-[0.3em]">GROUP</p>
          </div>
        </div>
        <p className="label-caps text-[0.55rem] text-faint mt-3 tracking-[0.2em]">
          TRADING JOURNAL
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 text-xs tracking-wide transition-colors ${
                isActive
                  ? 'bg-bg text-white border-l-2 border-white pl-[10px]'
                  : 'text-muted hover:text-white hover:bg-bg'
              }`
            }
          >
            <Icon size={14} strokeWidth={1.5} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-border">
        <p className="text-xs text-white font-medium truncate">{user?.name}</p>
        <p className="text-[0.65rem] text-faint truncate mt-0.5">{user?.email}</p>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 mt-3 text-faint hover:text-white text-[0.65rem] tracking-widest uppercase transition-colors"
        >
          <LogOut size={11} />
          Uitloggen
        </button>
      </div>
    </aside>
  )
}
