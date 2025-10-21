import Script from 'next/script'
import { useEffect } from 'react'

import siteMetadata from '@/data/siteMetadata'

const GAScript = () => {
  useEffect(() => {
    // 确保只在客户端执行，避免 SSR/CSR 不一致
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('js', new Date())
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

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const logEvent = (action, category, label, value) => {
  window.gtag?.('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  })
}
