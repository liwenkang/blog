const Sentry = require('@sentry/nextjs')

/** @type {import('next').NextInstrumentation} */
function register() {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 1.0,
    debug: false,
    environment: process.env.NODE_ENV,
  })
}

module.exports = register
