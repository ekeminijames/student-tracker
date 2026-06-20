# Edge Functions

Server-side logic (Deno) lives here. Planned functions by tier:

- `bulk-upload` — validate + dedupe a CSV of students, create auth users, queue invite emails (Tier 1)
- `scheduler` — compute assessment dates from curriculum rules (Tier 2)
- `grade-attempt` — auto-grade a submitted CBT attempt (Tier 3b)
- `anti-cheat-log` — ingest exam integrity events (Tier 3b)

Secrets (service_role key, Upstash tokens, Sentry DSN) are set via
`supabase secrets set` — never committed.
