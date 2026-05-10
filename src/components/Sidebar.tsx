import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, BookOpen, PlusCircle, BarChart2,
  CalendarDays, LogOut, Globe, ChevronRight, ChevronLeft
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { LANGUAGES } from '../i18n'

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const [collapsed, setCollapsed] = useState(window.innerWidth < 1024)
  const [langOpen, setLangOpen] = useState(false)

  const nav = [
    { to: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { to: '/trades',    label: t('nav.trades'),    icon: BookOpen },
    { to: '/add',       label: t('nav.addTrade'),  icon: PlusCircle },
    { to: '/calendar',  label: t('nav.calendar'),  icon: CalendarDays },
    { to: '/analytics', label: t('nav.analytics'), icon: BarChart2 },
  ]

  const current = LANGUAGES.find(l => l.code === i18n.language) ?? LANGUAGES[1]

  return (
    <aside className={`relative flex flex-col bg-card border-r border-border transition-all duration-200 min-h-screen ${collapsed ? 'w-14' : 'w-56'}`}>

      {/* Toggle button */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className="absolute -right-3 top-6 z-10 w-6 h-6 bg-card border border-border flex items-center justify-center text-muted hover:text-white transition-colors"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Logo */}
      <div className={`border-b border-border flex items-center gap-3 ${collapsed ? 'px-3 py-5 justify-center' : 'px-5 pt-6 pb-5'}`}>
        <div className="w-8 h-8 border border-border-light flex items-center justify-center flex-shrink-0">
          <span className="brand-title text-base text-white leading-none">H</span>
        </div>
        {!collapsed && (
          <div>
            <p className="brand-title text-sm tracking-widest text-white leading-tight">HANSSENS</p>
            <p className="label-caps text-[0.55rem] text-faint tracking-[0.3em]">GROUP</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 px-2 py-2.5 text-xs tracking-wide transition-colors ${collapsed ? 'justify-center' : ''}
              ${isActive
                ? 'bg-bg text-white border-l-2 border-white'
                : 'text-muted hover:text-white hover:bg-bg'}`
            }
          >
            <Icon size={15} strokeWidth={1.5} className="flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Language switcher */}
      <div className={`border-t border-border relative ${collapsed ? 'px-2 py-3 flex justify-center' : 'px-4 py-3'}`}>
        <button
          onClick={() => setLangOpen(o => !o)}
          title={collapsed ? current.label : undefined}
          className="flex items-center gap-2 text-muted hover:text-white transition-colors text-xs w-full"
        >
          <Globe size={13} className="flex-shrink-0" />
          {!collapsed && <span className="flex-1 text-left">{current.flag} {current.label}</span>}
        </button>
        {langOpen && (
          <div className={`absolute bottom-full mb-1 bg-card border border-border z-50 ${collapsed ? 'left-full ml-2 w-36' : 'left-3 right-3'}`}>
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => { i18n.changeLanguage(lang.code); setLangOpen(false) }}
                className={`flex items-center gap-2 w-full px-3 py-2 text-xs transition-colors hover:bg-bg ${i18n.language === lang.code ? 'text-white' : 'text-muted'}`}
              >
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* User */}
      <div className={`border-t border-border ${collapsed ? 'px-2 py-4 flex flex-col items-center gap-2' : 'px-4 py-4'}`}>
        {!collapsed && (
          <>
            <p className="text-xs text-white font-medium truncate">{user?.name}</p>
            <p className="text-[0.65rem] text-faint truncate mt-0.5">{user?.email}</p>
          </>
        )}
        <button
          onClick={() => { logout(); navigate('/login') }}
          title={collapsed ? t('nav.logout') : undefined}
          className={`flex items-center gap-2 text-faint hover:text-white text-[0.65rem] tracking-widest uppercase transition-colors ${collapsed ? 'mt-0' : 'mt-3'}`}
        >
          <LogOut size={13} />
          {!collapsed && t('nav.logout')}
        </button>
      </div>
    </aside>
  )
}
