import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const ok = await login(email, password)
    setLoading(false)
    if (ok) {
      navigate('/dashboard')
    } else {
      setError('Invalid credentials. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-bg grid-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="flex items-start gap-5 mb-10">
          <div className="w-14 h-14 border border-border-light flex items-center justify-center flex-shrink-0">
            <span className="brand-title text-3xl text-white leading-none">H</span>
          </div>
          <div className="border-l border-border-light pl-5 py-1">
            <h1 className="brand-title text-3xl text-white leading-none tracking-widest">
              HANSSENS
            </h1>
            <p className="label-caps mt-1 mb-3">GROUP</p>
            <div className="h-px w-full bg-border-light mb-3" />
            <p className="label-caps text-faint tracking-[0.25em]">
              ANALYSE &nbsp;·&nbsp; TRADES &nbsp;·&nbsp; PORTFOLIO
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="border border-border bg-card p-8">
          <div className="mb-6">
            <p className="label-caps text-muted mb-1">Toegang</p>
            <h2 className="brand-title text-2xl text-white">Trading Journal</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label-caps block mb-2">E-mailadres</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="tim@hanssensgroup.be"
                className="w-full bg-bg border border-border px-4 py-3 text-sm text-white placeholder:text-faint focus:outline-none focus:border-border-light transition-colors"
              />
            </div>

            <div>
              <label className="label-caps block mb-2">Wachtwoord</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-bg border border-border px-4 py-3 text-sm text-white placeholder:text-faint focus:outline-none focus:border-border-light transition-colors"
              />
            </div>

            {error && (
              <p className="text-loss text-xs tracking-wide">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-white text-bg font-semibold text-sm tracking-widest py-3 uppercase hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              {loading ? 'Laden...' : 'Inloggen'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center mt-6">
          <p className="label-caps text-faint">België</p>
          <p className="label-caps text-faint">© {new Date().getFullYear()} Hanssens Group</p>
        </div>
      </div>
    </div>
  )
}
