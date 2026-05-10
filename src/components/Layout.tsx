import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Sidebar from './Sidebar'

export default function Layout() {
  const { user } = useAuth()

  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="flex h-full min-h-screen w-full bg-bg">
      <Sidebar />
      <main className="flex-1 overflow-auto w-full min-w-0">
        <Outlet />
      </main>
    </div>
  )
}
