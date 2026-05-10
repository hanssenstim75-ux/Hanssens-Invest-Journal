import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  email: string
  name: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

const DEMO_USER = { email: 'tim@hanssensgroup.be', name: 'Tim Hanssens' }

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('hg_user')
    if (stored) setUser(JSON.parse(stored))
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    if (!email || password.length < 4) return false
    const u = { email, name: email === DEMO_USER.email ? DEMO_USER.name : email.split('@')[0] }
    setUser(u)
    localStorage.setItem('hg_user', JSON.stringify(u))
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('hg_user')
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
