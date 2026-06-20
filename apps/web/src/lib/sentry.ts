import * as Sentry from '@sentry/react'

// Initialise error tracking only when a DSN is provided. No DSN -> no-op, so
// local dev and un-configured environments stay silent.
const dsn = import.meta.env.VITE_SENTRY_DSN

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
    environment: import.meta.env.MODE,
  })
}

export { Sentry }
