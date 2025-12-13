import type { Metric } from 'web-vitals'

declare global {
  interface Window {
    gtag?: (command: string, eventName: string, eventParams: any) => void
    Sentry?: {
      addBreadcrumb: (breadcrumb: {
        category: string
        message: string
        level: string
        data: any
      }) => void
    }
  }
}

function sendToAnalytics(metric: Metric): void {
  // Send to any analytics service
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      non_interaction: true,
    })
  }

  // Send to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Web Vitals] ${metric.name}:`, metric.value, metric)
  }

  // Send to Sentry if available
  if (typeof window !== 'undefined' && window.Sentry) {
    window.Sentry.addBreadcrumb({
      category: 'performance',
      message: `${metric.name}: ${metric.value}`,
      level: 'info',
      data: metric,
    })
  }
}

export function reportWebVitals(): void {
  if (typeof window !== 'undefined') {
    import('web-vitals').then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
      onCLS(sendToAnalytics)
      onINP(sendToAnalytics)
      onFCP(sendToAnalytics)
      onLCP(sendToAnalytics)
      onTTFB(sendToAnalytics)
    })
  }
}

// Alternative named export for Vite/SPA usage
export function reportWebVitalsVite(onPerfEntry?: (metric: Metric) => void): void {
  if (typeof window !== 'undefined' && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
      onCLS(onPerfEntry)
      onINP(onPerfEntry)
      onFCP(onPerfEntry)
      onLCP(onPerfEntry)
      onTTFB(onPerfEntry)
    })
  }
}
