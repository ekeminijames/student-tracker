import { createContext, useEffect, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { isRole, type Role } from '@emi/shared'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

interface AuthState {
  session: Session | null
  user: User | null
  role: Role | null
  loading: boolean
  configured: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (
    email: string,
    password: string,
    fullName: string,
    role: Role,
  ) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthState | null>(null)

// Reads the role claim from the JWT. Supabase exposes custom claims under
// app_metadata; we fall back to user_metadata for the signup-time hint.
function roleFromUser(user: User | null): Role | null {
  const claim =
    (user?.app_metadata as Record<string, unknown> | undefined)?.role ??
    (user?.user_metadata as Record<string, unknown> | undefined)?.role
  return isRole(claim) ? claim : null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState<boolean>(isSupabaseConfigured)

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
    })

    return () => sub.subscription.unsubscribe()
  }, [])

  const value: AuthState = {
    session,
    user: session?.user ?? null,
    role: roleFromUser(session?.user ?? null),
    loading,
    configured: isSupabaseConfigured,

    async signIn(email, password) {
      if (!supabase) return { error: 'Backend not connected.' }
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      return { error: error?.message ?? null }
    },

    async signUp(email, password, fullName, role) {
      if (!supabase) return { error: 'Backend not connected.' }
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, role } },
      })
      return { error: error?.message ?? null }
    },

    async signOut() {
      if (!supabase) return
      await supabase.auth.signOut()
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
