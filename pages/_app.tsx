import '@/css/tailwind.css'
import '@/css/prism.css'
import 'katex/dist/katex.css'

import '@fontsource/inter/index.css'
import React from 'react'

import { ThemeProvider } from 'next-themes'
import Head from 'next/head'
import { AppProps } from 'next/app'

import siteMetadata from '@/data/siteMetadata'
import Analytics from '@/components/analytics'
import LayoutWrapper from '@/components/LayoutWrapper'
import SkipToContent from '@/components/SkipToContent'
import { ClientReload } from '@/components/ClientReload'
import ErrorBoundary from '@/components/ErrorBoundary'
import PerformanceMonitorV2 from '@/components/PerformanceMonitorV2'
import { WebVitalsTracker, RoutePerformanceTracker } from '@/components/PerformanceTracker'
import { reportWebVitals } from '@/lib/web-vitals'
import { logger } from '@/lib/core/logger'
import { getEnv } from '@/lib/config/env'

// 开发环境下验证环境变量
if (process.env.NODE_ENV === 'development') {
  try {
    logger.info('🔧 应用启动：验证环境变量...')
    getEnv(false) // 非严格模式，允许部分配置缺失
    logger.success('环境变量加载完成')
  } catch (error) {
    logger.warn('环境变量验证失败，部分功能可能不可用', { error: (error as Error).message })
  }
}

const isDevelopment = process.env.NODE_ENV === 'development'
const isSocket = process.env.SOCKET

export default function App({ Component, pageProps }: AppProps) {
  // Report web vitals
  React.useEffect(() => {
    if (globalThis.window !== undefined) {
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
      <PerformanceMonitorV2 />
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
