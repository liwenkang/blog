import '@/css/tailwind.css'
import '@/css/prism.css'
import 'katex/dist/katex.css'

import '@fontsource/inter/index.css'
import React from 'react'

import { ThemeProvider } from 'next-themes'
import Head from 'next/head'

import siteMetadata from '@/data/siteMetadata'
import Analytics from '@/components/analytics'
import LayoutWrapper from '@/components/LayoutWrapper'
import SkipToContent from '@/components/SkipToContent'
import { ClientReload } from '@/components/ClientReload'
import ErrorBoundary from '@/components/ErrorBoundary'
import PerformanceMonitor from '@/components/PerformanceMonitor'
import { WebVitalsTracker, RoutePerformanceTracker } from '@/components/PerformanceTracker'
import { reportWebVitals } from '@/lib/web-vitals'

// 开发环境下导入环境验证
if (process.env.NODE_ENV === 'development') {
  import('@/lib/env-validation').then(({ validateAllEnvVars }) => {
    console.log('🔧 应用启动：验证环境变量...')
    validateAllEnvVars()
  })
}

const isDevelopment = process.env.NODE_ENV === 'development'
const isSocket = process.env.SOCKET

export default function App({ Component, pageProps }) {
  // Report web vitals
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      reportWebVitals()
    }
  }, [])

  return (
    <ThemeProvider attribute="class" defaultTheme={siteMetadata.theme}>
      <Head>
        <meta content="width=device-width, initial-scale=1" name="viewport" />
      </Head>
      <SkipToContent />
      {isDevelopment && isSocket && <ClientReload />}
      <Analytics />
      <PerformanceMonitor />
      <WebVitalsTracker />
      <RoutePerformanceTracker />
      <ErrorBoundary>
        <LayoutWrapper>
          <Component {...pageProps} />
        </LayoutWrapper>
      </ErrorBoundary>
    </ThemeProvider>
  )
}
