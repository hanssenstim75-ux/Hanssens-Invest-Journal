import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, BookOpen, PlusCircle, BarChart2, CalendarDays, LogOut, Globe, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { LANGUAGES } from '../i18n'

interface Props {
  onClose?: () => void
}

export default function Sidebar({ onClose }: Props) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const [langOpen, setLangOpen] = useState(false)

  const nav = [
    { to: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { to: '/trades',    label: t('nav.trades'),    icon: BookOpen },
    { to: '/add',       label: t('nav.addTrade'),  icon: PlusCircle },
    { to: '/calendar',  label: t('nav.calendar'),  icon: CalendarDays },
    { to: '/analytics', label: t('nav.analytics'), icon: BarChart2 },
  ]

  const current = LANGUAGES.find(l => l.code === i18n.language) ?? LANGUAGES[1]

  const handleNav = () => { if (onClose) onClose() }

  return (
    <aside className="w-56 h-full min-h-screen bg-card border-r border-border flex flex-col">
      {/* Logo */}
      <div className="px-5 pt-6 pb-5 border-b border-border flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border border-border-light flex items-center justify-center flex-shrink-0">
              <span className="brand-title text-base text-white leading-none">H</span>
            </div>
            <div>
              <p className="brand-title text-sm tracking-widest text-white leading-tight">HANSSENS</p>
              <p className="label-caps text-[0.55rem] text-faint tracking-[0.3em]">GROUP</p>
            </div>
          </div>
          <p className="label-caps text-[0.55rem] text-faint mt-3 tracking-[0.2em]">{t('common.tradingJournal')}</p>
        </div>
        {/* Close button mobile only */}
        <button onClick={onClose} className="lg:hidden text-faint hover:text-white transition-colors mt-1">
          <X size={16} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} onClick={handleNav}
            className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 text-xs tracking-wide transition-colors ${isActive ? 'bg-bg text-white border-l-2 border-white pl-[10px]' : 'text-muted hover:text-white hover:bg-bg'}`}>
            <Icon size={14} strokeWidth={1.5} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Language switcher */}
      <div className="px-4 pb-3 border-t border-border pt-3 relative">
        <button onClick={() => setLangOpen(o => !o)}
          className="flex items-center gap-2 w-full text-muted hover:text-white transition-colors text-xs">
          <Globe size={12} />
          <span className="flex-1 text-left">{current.flag} {current.label}</span>
        </button>
        {langOpen && (
          <div className="absolute bottom-full left-3 right-3 mb-1 bg-card border border-border z-50">
            {LANGUAGES.map(lang => (
              <button key={lang.code}
                onClick={() => { i18n.changeLanguage(lang.code); setLangOpen(false) }}
                className={`flex items-center gap-2 w-full px-3 py-2 text-xs transition-colors hover:bg-bg ${i18n.language === lang.code ? 'text-white' : 'text-muted'}`}>
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* User */}
      <div className="px-4 py-4 border-t border-border">
        <p className="text-xs text-white font-medium truncate">{user?.name}</p>
        <p className="text-[0.65rem] text-faint truncate mt-0.5">{user?.email}</p>
        <button onClick={() => { logout(); navigate('/login') }}
          className="flex items-center gap-2 mt-3 text-faint hover:text-white text-[0.65rem] tracking-widest uppercase transition-colors">
          <LogOut size={11} />
          {t('nav.logout')}
        </button>
      </div>
    </aside>
  )
}
