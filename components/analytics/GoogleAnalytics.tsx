import Script from 'next/script'
import { useEffect } from 'react'

import siteMetadata from '@/data/siteMetadata'

declare global {
  interface Window {
    gtag?: (command: string, eventName: string, eventParams: any) => void
    dataLayer?: any[]
  }
}

const GAScript = () => {
  useEffect(() => {
    // 确保只在客户端执行，避免 SSR/CSR 不一致
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('js', 'event', new Date())
    }
  }, [])

  return (
    <>
      <Script
        strategy="lazyOnload"
        src={`https://www.googletagmanager.com/gtag/js?id=${siteMetadata.analytics.googleAnalyticsId}`}
      />

      <Script strategy="lazyOnload" id="ga-script">
        {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('config', '${siteMetadata.analytics.googleAnalyticsId}', {
              page_path: window.location.pathname,
            });
        `}
      </Script>
    </>
  )
}

export default GAScript

interface LogEventParams {
  event_category?: string
  event_label?: string
  value?: number
}

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const logEvent = (action: string, category?: string, label?: string, value?: number) => {
  const params: LogEventParams = {}
  if (category) params.event_category = category
  if (label) params.event_label = label
  if (value !== undefined) params.value = value

  window.gtag?.('event', action, params)
}
