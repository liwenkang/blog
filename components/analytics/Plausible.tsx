import Script from 'next/script'

import siteMetadata from '@/data/siteMetadata'

declare global {
  interface Window {
    plausible?: (eventName: string, ...rest: any[]) => void
  }
}

const PlausibleScript = () => {
  return (
    <>
      <Script
        strategy="lazyOnload"
        data-domain={siteMetadata.analytics.plausibleDataDomain}
        src="https://plausible.io/js/plausible.js"
      />
      <Script strategy="lazyOnload" id="plausible-script">
        {`
            window.plausible = window.plausible || function() { (window.plausible.q = window.plausible.q || []).push(arguments) }
        `}
      </Script>
    </>
  )
}

export default PlausibleScript

// https://plausible.io/docs/custom-event-goals
export const logEvent = (eventName: string, ...rest: any[]) => {
  return window.plausible?.(eventName, ...rest)
}
