import React, { Component, ErrorInfo, ReactNode } from 'react'
import Link from 'next/link'

// Import Sentry only on client side
let Sentry: typeof import('@sentry/nextjs') | undefined
if (globalThis.window !== undefined) {
  Sentry = require('@sentry/nextjs')
}

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(_error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI.
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Catch errors in any components below and re-render with error message
    this.setState({
      error: error,
      errorInfo: errorInfo,
    })

    // You can also log error messages to an error reporting service here
    if (globalThis.window !== undefined && Sentry) {
      Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
      })
    }
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
          <div className="max-w-md mx-auto text-center">
            <div className="mb-8">
              <h1 className="text-6xl font-bold text-gray-800 dark:text-white mb-4">😵</h1>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                出现了意外错误
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                抱歉，页面遇到了一些问题。我们已经记录了这个问题，正在努力修复。
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => globalThis.location.reload()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
              >
                重新加载页面
              </button>

              <Link
                href="/"
                className="block w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium py-2 px-4 rounded-lg transition duration-200"
              >
                返回首页
              </Link>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-8 text-left">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300">
                  错误详情（开发模式）
                </summary>
                <pre className="mt-2 p-4 bg-red-50 dark:bg-red-900/20 rounded text-xs overflow-auto">
                  <code className="text-red-800 dark:text-red-400">
                    {this.state.error?.toString()}
                    <br />
                    <br />
                    {this.state.errorInfo?.componentStack}
                  </code>
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
