# EMI LMS — Status

_Living document. Updated at each checkpoint._

## Where we are
**Day 1 / Tier 0 — Foundation (skeleton in place, not yet running live).**

The repo has been restructured into the planned monorepo and the app shell + auth
code are built. Nothing runs end-to-end yet because the external accounts (Supabase
etc.) don't exist — see "Blocked on accounts" below.

## Done
- Monorepo restructure: `apps/web`, `packages/shared`, `supabase/`, `.github/workflows`, `docs/handoff`.
- `@emi/shared` package: roles, user types, zod validation schemas (single source of truth).
- TypeScript wired into `apps/web` (incremental — existing JSX still compiles).
- Supabase client wrapper that degrades gracefully when unconfigured.
- Auth: `AuthProvider`, `useAuth`, `ProtectedRoute`, sign in / sign up / sign out.
- Role-based routing: student / mentor / admin·superadmin land on their own dashboard.
- Branded **"Backend not connected yet"** screen so the app is never broken pre-accounts.
- Migration `0001_init_users_roles.sql`: `user_role` enum, `public.users`, auto-provision
  trigger from `auth.users`, and Row-Level Security (own-row read; admins read all).
- Sentry init (no-op until a DSN is provided).
- GitHub Actions CI: install → typecheck → build.

## Blocked on accounts (only a human can do these)
Nothing live works until these exist and their keys are provided:
1. **Supabase** project → `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` into `apps/web/.env`.
2. Hosting (**Vercel** per blueprint, or Railway — see open decision) for deploys.
3. Sentry / Upstash come online in later tiers.

To switch the app on locally: copy `apps/web/.env.example` → `apps/web/.env`, fill in the
Supabase URL + anon key, restart.

## Open decisions for the architect
1. **Hosting: Vercel (free, in the blueprint) vs Railway (~$5/mo).** What would Railway host,
   given the backend is Supabase? Needs a call before deploy wiring.
2. **Missing schema link:** there is no student↔course relationship in the blueprint. An
   `enrollments` table (or a cohort→course rule) is needed before Tier 2.
3. **Offline exams:** should CBT work fully offline (integrity trade-offs), or online-only
   for high-stakes assessments? Affects Tier 3b scope and the Day 7 checkpoint.

## Legacy (to salvage, not deleted)
The original student-tracker pages (`src/pages/Dashboard.jsx`, `Attendance.jsx`, `Marks.jsx`,
`Assignments.jsx`, `components/Navbar.jsx`, `context/AppContext.jsx`) remain in the repo,
unrouted, for component salvage in later tiers.

## Next
**Tier 1 (Day 2):** full RLS per role/table, `cohorts`/`semesters`, bulk CSV onboarding
Edge Function, sidebar nav shell. Do not start until the Supabase project exists.
