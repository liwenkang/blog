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

/**
 * 捕获 Next.js 嵌套 React 服务器组件的错误
 * @param {Error} err - 错误对象
 * @param {import('next/server').NextRequest} request - 请求对象
 * @param {Object} context - 上下文信息
 */
function onRequestError(err, request, context) {
  Sentry.captureException(err, {
    contexts: {
      nextjs: {
        request: {
          url: request?.url,
          method: request?.method,
          headers: Object.fromEntries(request?.headers || []),
        },
        ...context,
      },
    },
  })
}

module.exports = { register, onRequestError }
