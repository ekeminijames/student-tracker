import { createContext, useEffect, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { isRole, type Role } from '@emi/shared'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

// NOTE: a user's role is read from the server-controlled `public.users` table,
// never from anything the browser can set (user_metadata). That is what stops
// a user from making themselves an admin.

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
  ) => Promise<{ error: string | null; session: Session | null }>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [role, setRole] = useState<Role | null>(null)
  const [loading, setLoading] = useState<boolean>(isSupabaseConfigured)

  // Track the auth session.
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

  // Fetch the role from the server whenever the signed-in user changes.
  const userId = session?.user?.id ?? null
  useEffect(() => {
    if (!supabase || !userId) {
      setRole(null)
      return
    }
    let active = true
    supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single()
      .then(({ data }) => {
        if (!active) return
        const r = (data as { role?: unknown } | null)?.role
        // Default to least privilege if no profile row is found.
        setRole(isRole(r) ? r : 'student')
      })
    return () => {
      active = false
    }
  }, [userId])

  const value: AuthState = {
    session,
    user: session?.user ?? null,
    role,
    loading,
    configured: isSupabaseConfigured,

    async signIn(email, password) {
      if (!supabase) return { error: 'Backend not connected.' }
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      return { error: error?.message ?? null }
    },

    async signUp(email, password, fullName, _role) {
      if (!supabase) return { error: 'Backend not connected.', session: null }
      // Role is intentionally NOT sent — the server assigns 'student' to every
      // new signup. Admins are promoted server-side only.
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      })
      return { error: error?.message ?? null, session: data.session }
    },

    async signOut() {
      if (!supabase) return
      await supabase.auth.signOut()
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
