import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInSchema } from '@emi/shared'
import { useAuth } from '../auth/useAuth'
import Logo from '../components/Logo'

// Sign-in only. Accounts are created by the institute (admin / bulk onboarding),
// not by public self-registration — this is what keeps outsiders out.
export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

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
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8 text-white">
          <Logo />
        </div>

        <div className="emi-card p-6">
          <h1 className="emi-title text-2xl mb-1">Sign In</h1>
          <p className="text-slate-400 text-sm mb-6">
            Enlightenment Mentorship Institute
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
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

            {error && <p className="text-red-400 text-xs">{error}</p>}

            <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-60">
              {busy ? 'Please wait…' : 'Sign In'}
            </button>
          </form>

          <p className="mt-4 text-xs text-slate-500 text-center">
            Accounts are created by the institute. Contact an administrator for access.
          </p>
        </div>
      </div>
    </div>
  )
}
