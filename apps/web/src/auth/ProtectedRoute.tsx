import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import type { Role } from '@emi/shared'
import { useAuth } from './useAuth'

// Guards a route: must be signed in, and (optionally) hold one of `allow` roles.
export default function ProtectedRoute({
  children,
  allow,
}: {
  children: ReactNode
  allow?: Role[]
}) {
  const { session, role, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        Loading…
      </div>
    )
  }

  if (!session) return <Navigate to="/login" replace />

  if (allow && (!role || !allow.includes(role))) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
