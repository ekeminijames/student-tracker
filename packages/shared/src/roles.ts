// Canonical list of user roles. Kept in one place so the frontend, validation
// schemas, and (mirrored) database enum never drift apart.
export const ROLES = ['student', 'mentor', 'admin', 'superadmin'] as const

export type Role = (typeof ROLES)[number]

export function isRole(value: unknown): value is Role {
  return typeof value === 'string' && (ROLES as readonly string[]).includes(value)
}

// Where each role should land after logging in.
export const ROLE_HOME: Record<Role, string> = {
  student: '/',
  mentor: '/',
  admin: '/',
  superadmin: '/',
}
