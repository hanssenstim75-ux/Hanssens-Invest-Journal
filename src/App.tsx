import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { TradeProvider } from './context/TradeContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Trades from './pages/Trades'
import AddTrade from './pages/AddTrade'
import Analytics from './pages/Analytics'
import Calendar from './pages/Calendar'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TradeProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/trades" element={<Trades />} />
              <Route path="/add" element={<AddTrade />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/analytics" element={<Analytics />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </TradeProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
