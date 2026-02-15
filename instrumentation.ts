import * as Sentry from '@sentry/nextjs'

/** Next.js Instrumentation */
export function register() {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 1.0,
    debug: false,
    environment: process.env.NODE_ENV,
  })
}

/**
 * 捕获 Next.js 嵌套 React 服务器组件的错误
 */
export function onRequestError(err: Error, request: any, context: Record<string, any>): void {
  const headers = request?.headers
  const serializedHeaders = (() => {
    if (!headers) return {}
    if (typeof headers?.entries === 'function') {
      return Object.fromEntries(headers.entries())
    }
    if (Array.isArray(headers)) {
      return Object.fromEntries(headers)
    }
    if (typeof headers === 'object') {
      return headers
    }
    return {}
  })()

  Sentry.captureException(err, {
    contexts: {
      nextjs: {
        request: {
          url: request?.url,
          method: request?.method,
          headers: serializedHeaders,
        },
        ...context,
      },
    },
  })
}
