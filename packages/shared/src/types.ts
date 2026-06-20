import type { Role } from './roles'

// Shape of a user profile row (public.users). Mirrors migration 0001.
export interface UserProfile {
  id: string
  role: Role
  full_name: string | null
  email: string | null
  created_at: string
  updated_at: string
}
