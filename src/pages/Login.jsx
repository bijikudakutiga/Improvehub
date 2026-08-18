import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'

export default function Login() {
  const { signIn, session } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (session) navigate('/', { replace: true })
  }, [session])

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await signIn(email, password)
    if (error) {
      setError('Email atau kata sandi salah.')
      setLoading(false)
    }
    // kalau sukses, useEffect di atas yang akan pindah halaman otomatis
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-tint px-4">
      <div className="animate-fadeIn w-full max-w-sm rounded-xl2 border border-lavender-200 bg-white p-8 shadow-lg shadow-ink-900/5">
        <div className="mb-6 flex flex-col items-center">
          <img src="/logo.png" alt="IMPROVEHUB" className="h-16 w-auto" />
          <p className="mt-2 text-xs text-lavender-500">Finance & Tax Portal</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-400">Email</label>
            <input
              type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="w-full rounded-xl border border-lavender-200 px-3 py-2.5 text-sm focus:border-lavender-400 focus:outline-none focus:ring-2 focus:ring-lavender-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-400">Kata Sandi</label>
            <input
              type="password" required value={password} onChange={e => setPassword(e.target.value)}
              className="w-full rounded-xl border border-lavender-200 px-3 py-2.5 text-sm focus:border-lavender-400 focus:outline-none focus:ring-2 focus:ring-lavender-100"
            />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button
            type="submit" disabled={loading}
            className="w-full rounded-xl bg-ink-900 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  )
}
