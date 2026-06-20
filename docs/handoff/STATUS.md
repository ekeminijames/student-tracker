# EMI LMS — Status

_Living document. Updated at each checkpoint._

## Where we are
**Day 1 / Tier 0 — Foundation: COMPLETE and running live.** ✅

The app is deployed on Vercel, connected to a live Supabase project, and auth works
end-to-end (sign up → role-based dashboard) both locally and in production.

## Done
- Monorepo: `apps/web`, `packages/shared`, `supabase/`, `.github/workflows`, `docs/handoff`.
- `@emi/shared`: roles, user types, zod validation (single source of truth).
- TypeScript wired into `apps/web` (incremental — existing JSX still compiles).
- Supabase Auth: sign in / sign up / sign out; signup logs in immediately when email
  confirmation is off.
- Role-based routing + route guard: student / mentor / admin·superadmin dashboards.
- Branded "backend not connected" fallback for un-configured environments.
- **Migration 0001 applied to the live Supabase project**: `user_role` enum, `public.users`,
  auto-provision trigger from `auth.users`, RLS (own-row read; admins read all).
- Sentry init (no-op until a DSN is provided).
- GitHub Actions CI: install → typecheck → build.
- **Deployed to Vercel** (monorepo root config), env vars set, Git reconnected after the
  repo rename. Live signup + login verified.

## Environment / accounts status
- **Supabase** — live project connected. URL + publishable (anon) key in `apps/web/.env`
  (local) and Vercel env vars (prod). `service_role` (secret) key NOT yet needed.
- **Vercel** — connected to repo `Enlightenment-Mentorship-Institute-Student-Tracker`,
  auto-deploys on push to `master`.
- **Email confirmation is currently OFF** in Supabase for launch testing. Before real
  production use, set up an SMTP / email provider and re-enable confirmation.
- **Supabase Auth → URL Configuration**: set Site URL + Redirect URLs to the Vercel domain
  (needed once password-reset / email flows are used).
- **Sentry / Upstash (Redis, QStash)** — not set up yet; needed in later tiers.

## Open decisions for the architect
1. **Hosting:** currently on **Vercel (free) and working**. Blueprint mentioned Railway
   (~$5/mo) — only worth switching if a separate always-on backend is added later.
2. **Missing schema link:** no student↔course relationship. An `enrollments` table (or a
   cohort→course rule) is needed before Tier 2.
3. **Offline exams:** full offline CBT vs online-only for high-stakes assessments. Affects
   Tier 3b scope and the Day 7 checkpoint.

## Legacy (to salvage, not deleted)
Original student-tracker pages (`src/pages/Dashboard.jsx`, `Attendance.jsx`, `Marks.jsx`,
`Assignments.jsx`, `components/Navbar.jsx`, `context/AppContext.jsx`) remain unrouted for
component salvage in later tiers.

## Next
**Tier 1 (Day 2):** full RLS per role/table, `cohorts`/`semesters` (+ `enrollments` pending
the decision above), bulk CSV onboarding Edge Function, sidebar nav shell.
