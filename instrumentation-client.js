import * as Sentry from '@sentry/nextjs'
import { Replay } from '@sentry/replay'

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN

Sentry.init({
  dsn: SENTRY_DSN,
  tracesSampleRate: 1.0,
  debug: false,
  environment: process.env.NODE_ENV,
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,

  integrations: [
    new Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
})

// Export Sentry hooks for Next.js instrumentation
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
export const onRequestError = Sentry.captureRequestError
