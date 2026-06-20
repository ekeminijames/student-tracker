# EMI LMS System — Backend Architecture & Sprint Blueprint
**Project:** LMS for The Enlightenment Mentorship Institute (EMI)
**Role — Architect:** Senior Backend Engineer
**Role — Builder:** Build agent
**Role — Owner / PM:** Project owner
**Repo:** EMI LMS (this repo)
**Timeline:** 10 days. Day 7 = core production-ready checkpoint. Day 10 = full launch.

> Names of specific people/tools have been kept generic by role on purpose. Source of
> truth for current progress is `STATUS.md` in this folder.

---

## 1. Engineering Position

Sized for **one institute**, realistic peak load in the low thousands of users with bursty
concurrency around exam windows. The architecture gives the system the *properties* of a
distributed system (durability, retry-safety, real-time updates, horizontal scale,
observability) without the *operational cost* of running one. Every "defer" has a stated
trigger for when to revisit — sequencing, not avoidance.

| Requested concept | Decision (Day 1–10) | When to actually adopt it |
|---|---|---|
| Kubernetes | **Defer.** Managed serverless autoscales for us. | Self-hosting required, or compute outgrows serverless pricing. |
| Kafka / RabbitMQ | **Defer.** Postgres triggers + `pg_cron` + serverless queue cover async jobs. | Event volume ~millions/day or multi-consumer streaming needed. |
| Microservices / mesh | **Defer.** Modular monolith with hard domain boundaries (`auth`, `curriculum`, `cbt`, `social`, `notifications`). | Multi-tenant SaaS where teams own/deploy services independently. |
| GraphQL | **Defer.** Supabase auto-generates typed REST/RPC from Postgres; PostgREST + RLS ships faster and secures easier. | Client data-shape needs make overfetching a real cost. |
| Elasticsearch | **Defer.** Postgres full-text search (`tsvector`) handles this scale. | FTS volume/relevance outgrows Postgres. |
| Load balancing | **Automatic** via edge infra. | N/A at this scale. |
| Circuit breaker | **Lightweight:** retry-with-backoff + alerting on failure spikes. | Multiple external deps with cascading-failure risk. |
| Sharding / partitioning | **Defer.** Single Postgres + proper indexing. Partition by `semester_id` later if needed. | A single table exceeds tens of millions of rows. |

**Taken seriously, no shortcuts:** Auth & authorization (Postgres RLS, not just app checks),
encryption in transit and at rest, rate limiting, CDN/WAF, CI/CD, observability, ACID on
grading/attendance, and offline-sync correctness for CBT.

---

## 2. Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | React 18 + Vite + TypeScript + Tailwind | Existing repo is React/Vite; TS for schema-safety. |
| PWA / Offline | `vite-plugin-pwa` + Dexie.js (IndexedDB) | Caches materials/exam payloads; queues attempts for sync. |
| Data/state | TanStack Query + Supabase JS | Caching, retries, background refetch, optimistic updates. |
| Backend / DB | Supabase (Postgres 15) | Managed Postgres + Auth + Storage + Realtime + Edge Functions; RLS for real authorization. |
| Auth | Supabase Auth (JWT) | Role claims in JWT, enforced via RLS — not trusted from client. |
| Serverless | Supabase Edge Functions (Deno) | Scheduler, bulk CSV, auto-grading, event ingestion. |
| Caching | Upstash Redis | Hot-path caching + rate limiting + scheduler idempotency locks. |
| Queue | Upstash QStash | Retryable async jobs (onboarding emails, notification fan-out). |
| File storage | Supabase Storage | Materials, video, PDFs. |
| CDN / WAF | Cloudflare | Asset delivery, DDoS protection, edge rate limiting. |
| Hosting | Vercel (see open decision re: Railway) | CI/CD-native, preview deploys per PR. |
| Realtime | Supabase Realtime | Social chat, presence, live exam-event feed. |
| CI/CD | GitHub Actions | Lint → typecheck → test → migration dry-run → deploy. |
| Observability | Sentry + Supabase logs + uptime monitor | Errors, infra health, status page. |
| VCS | GitHub, trunk-based, protected `main`, required CI | Linear, cherry-pick-friendly history. |

---

## 3. Repo Structure

```
/
├── apps/web/                # React + Vite PWA — all roles, route-gated by JWT claim
├── supabase/
│   ├── migrations/          # SQL schema as code, sequential
│   ├── functions/           # Edge Functions
│   └── config.toml
├── packages/shared/         # Shared TS types, zod schemas, constants
├── .github/workflows/       # CI
└── docs/handoff/            # Rolling state docs
```

---

## 4. Core Schema (initial — full DDL is a per-tier deliverable)

```
users (id, role, full_name, email, cohort_id, created_at)
cohorts (id, name, semester_id)
semesters (id, name, start_date, end_date)

courses (id, title, semester_id, mentor_id)
modules (id, course_id, title, order_index, duration_days)
materials (id, module_id, type, storage_path, title)

curriculum_rules (id, course_id, rule_type, trigger, offset_days)
assessments (id, course_id, type, generated_date, duration_minutes, question_bank_id)
   -- generated_date is COMPUTED by the scheduler, never set manually

questions (id, bank_id, prompt, choices, correct_answer, weight)
attempts (id, assessment_id, student_id, status, started_at, submitted_at, score, synced_at)
attempt_events (id, attempt_id, event_type, timestamp)
   -- blur, fullscreen_exit, copy_attempt, tab_switch — logged locally, synced on reconnect

attendance (id, student_id, date, status)
submissions (id, assignment_id, student_id, status, score)

channels (id, course_id, name)
messages (id, channel_id, user_id, content, created_at)
```

> **Architect note (added during Tier 0):** there is no student↔course link yet. An
> `enrollments` table is required before Tier 2. See `STATUS.md` open decisions.

RLS pattern: every table scoped by role + `cohort_id`/`course_id` ownership. Students see
only their own rows; mentors see rows for courses they own; admins see institute-wide.

---

## 5. Sprint Breakdown — 10 Days, 6 Tiers

**Day 7 = "core production-ready":** auth, bulk onboarding, curriculum auto-scheduler,
content delivery, online CBT live and deployed.
**Day 10 = full launch:** offline CBT hardening, anti-malpractice logging, dashboards,
social room, security/observability hardening.

- **Tier 0 — Day 1 — Foundation:** monorepo, Supabase envs, CI skeleton, base `users`/roles
  migration + RLS, auth end-to-end, Sentry. _DoD:_ PWA shell on staging, login works for all
  roles, CI green.
- **Tier 1 — Day 2 — Identity & Bulk Onboarding:** full RLS, `cohorts`/`semesters`, bulk CSV
  upload Edge Function, sidebar nav shell. _DoD:_ 200-student CSV → accounts + role dashboards.
- **Tier 2 — Day 3–4 — Curriculum + Auto-Scheduler:** courses/modules/materials/rules,
  idempotent scheduler Edge Function, builder UI. _DoD:_ define a semester once → full
  assessment calendar auto-generates.
- **Tier 3a — Day 5 — Content Delivery:** materials storage, student course view, progress %,
  service-worker offline browsing. _DoD:_ browse a course offline after first visit.
- **Tier 3b — Day 6–7 — CBT Engine (core):** question bank, randomized pull, offline attempt
  flow, client anti-malpractice logging, auto-grading + sync. _DoD (Day 7):_ complete a quiz
  (online; offline per open decision), results auto-grade on reconnect, mentor sees event log.
- **Tier 4 — Day 8 — Dashboards & Monitoring:** mentor at-risk/event views, student progress,
  Redis caching + rate limiting. _DoD:_ flagged events + at-risk students in one view.
- **Tier 5 — Day 9 — Social Room:** channels/messages, Realtime chat, presence, moderation.
  _DoD:_ real-time course-scoped chat.
- **Tier 6 — Day 10 — Hardening & Launch:** RLS audit, rate-limit tuning, secrets audit, load
  test, observability finalized, prod deploy gate. _DoD:_ production deploy, monitored,
  documented.

> **Architect notes (Tier 0 review):** (a) treat anti-malpractice as deterrence + logging,
> not prevention — browser controls are bypassable; real integrity is server-side. (b) Make
> role-based RLS tests a per-tier DoD, not a Day-10 audit. (c) Don't trust client timestamps
> on offline attempt sync; high-stakes exams likely online-only. (d) Day 1 is heavy — auth
> e2e may slip to Day 2.

---

## 6. Builder Brief — Day 1 (Tier 0)

> Build the LMS backend for a single institute (EMI). Stack is fixed — no Kubernetes, Kafka,
> RabbitMQ, microservices, or GraphQL. It's Supabase (Postgres + Auth + Storage + Edge
> Functions) + hosting + Cloudflare + Upstash.
>
> **Scope (Tier 0 only):** monorepo restructure; migration `0001_init_users_roles.sql`
> (`users` + role enum + baseline RLS); Supabase Auth wired into `apps/web` (signup, login,
> session persistence, role-based route guard); GitHub Actions CI (lint/typecheck/build);
> Sentry on the frontend. Do not build curriculum, CBT, or social yet.
>
> **DoD:** PWA shell deploys to a preview URL; a user can sign up/log in for each of the 4
> roles and land on a role-correct (even if empty) dashboard; CI passes. Conventional commits.
> If a schema/business decision is ambiguous, stop and ask the architect.

Each day's brief is written against what actually shipped the day before.

---

## 7. Account Setup Checklist (before going live)

Do in order; later steps need earlier values. Use a password manager.

1. **GitHub** — own/admin the repo; protect `main` (require PR + passing `ci`).
2. **Supabase** — org + three projects (`dev`, `staging`, `prod`). Free for dev/staging; prod
   on Pro (~$25/mo) after Day 7 (free pauses after 7 days inactivity). Region: closest to
   Nigeria with low latency (EU, e.g. Frankfurt — no Africa region yet). Grab Project URL,
   `anon` key, `service_role` key (server-only), DB connection string. Optionally disable
   public sign-ups (invite-only via bulk upload).
3. **Hosting** — import repo; root dir `apps/web`. Env per environment:
   `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SENTRY_DSN`. Never put `service_role` here.
4. **Cloudflare** — add domain; point DNS to host; enable HTTPS rewrites, WAF, rate-limit
   `/auth/*` and `/api/*` (verify these match the real request paths).
5. **Upstash** — one Redis (cache + rate limit) + one QStash (jobs). REST URL + token →
   Supabase Edge Function secrets.
6. **Sentry** — one frontend project + one edge project. Grab both DSNs.

**Secret locations:** `anon` key + frontend Sentry DSN → host env vars. `service_role` key,
Upstash tokens, edge Sentry DSN → Supabase Edge Function secrets. DB connection string →
local `.env` only (gitignored).

---

## 8. Handoff Protocol

- This doc + `STATUS.md` are regenerated at the end of every sprint day.
- Ask to "compile the handoff" anytime for an updated version (shipped / in-progress / open
  decisions / next brief).
- A fresh builder session needs only these docs + the current repo to continue with zero
  re-explanation.

---

_Status: see `STATUS.md`._
