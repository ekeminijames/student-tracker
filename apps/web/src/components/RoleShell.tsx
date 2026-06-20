import type { ReactNode } from 'react'
import { useAuth } from '../auth/useAuth'
import Logo from './Logo'

// Shared dashboard frame: branded top bar with the signed-in user + sign-out,
// and a content area. Each role dashboard renders inside this.
export default function RoleShell({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  const { user, role, signOut } = useAuth()

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="sticky top-0 z-20 border-b border-white/10 bg-emi-black/70 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="text-white">
            <Logo />
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-sm text-slate-200 leading-tight">{user?.email}</div>
              <div className="text-xs text-slate-500 capitalize">{role ?? 'no role'}</div>
            </div>
            <button
              onClick={() => signOut()}
              className="px-4 py-2 rounded-full text-sm font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8">
        <h1 className="emi-title text-3xl md:text-4xl mb-1">{title}</h1>
        {children}
      </main>
    </div>
  )
}
