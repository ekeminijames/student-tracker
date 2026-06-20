import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROLES, signInSchema, signUpSchema, type Role } from '@emi/shared'
import { useAuth } from '../auth/useAuth'
import Logo from '../components/Logo'

type Mode = 'signin' | 'signup'

export default function Login() {
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<Role>('student')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setNotice('')

    if (mode === 'signin') {
      const parsed = signInSchema.safeParse({ email, password })
      if (!parsed.success) {
        setError(parsed.error.issues[0].message)
        return
      }
      setBusy(true)
      const { error } = await signIn(email, password)
      setBusy(false)
      if (error) setError(error)
      else navigate('/', { replace: true })
    } else {
      const parsed = signUpSchema.safeParse({ email, password, fullName, role })
      if (!parsed.success) {
        setError(parsed.error.issues[0].message)
        return
      }
      setBusy(true)
      const { error, session } = await signUp(email, password, fullName, role)
      setBusy(false)
      if (error) setError(error)
      else if (session) navigate('/', { replace: true })
      else setNotice('Account created. Check your email to confirm, then sign in.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8 text-white">
          <Logo />
        </div>

        <div className="emi-card p-6">
          <h1 className="emi-title text-2xl mb-1">
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </h1>
          <p className="text-slate-400 text-sm mb-6">
            Enlightenment Mentorship Institute
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <div>
                <label className="text-xs font-medium text-slate-400">Full name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1 w-full border border-white/15 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-slate-400">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full border border-white/15 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-400">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full border border-white/15 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>

            {mode === 'signup' && (
              <div>
                <label className="text-xs font-medium text-slate-400">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="mt-1 w-full border border-white/15 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 capitalize"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {error && <p className="text-red-400 text-xs">{error}</p>}
            {notice && <p className="text-emerald-400 text-xs">{notice}</p>}

            <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-60">
              {busy ? 'Please wait…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <button
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin')
              setError('')
              setNotice('')
            }}
            className="mt-4 text-sm text-slate-400 hover:text-white transition w-full text-center"
          >
            {mode === 'signin'
              ? "Don't have an account? Create one"
              : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  )
}
