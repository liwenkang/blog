import { useEffect, useRef, ReactNode } from 'react'

interface PerformanceMetrics {
  trackId: string
  renderTime: number
  timestamp: string
}

interface PerformanceTrackerProps {
  children: ReactNode
  trackId?: string
  onPerformanceMetrics?: ((metrics: PerformanceMetrics) => void) | null
}

interface ResourceMetrics {
  name: string
  loadTime: number
  size: number
  timestamp: string
}

interface ResourceTrackerProps {
  resources?: string[]
}

interface ResourceTrackerReturn {
  loadedResources: ResourceMetrics[]
  loadingResources: Set<string>
}

// Performance tracking component
export const PerformanceTracker = ({
  children,
  trackId = 'component',
  onPerformanceMetrics = null,
}: PerformanceTrackerProps) => {
  const startTimeRef = useRef<number | null>(null)

  useEffect(() => {
    startTimeRef.current = performance.now()

    return () => {
      if (startTimeRef.current) {
        const endTime = performance.now()
        const renderTime = endTime - startTimeRef.current

        const newMetrics: PerformanceMetrics = {
          trackId,
          renderTime: Math.round(renderTime * 100) / 100,
          timestamp: new Date().toISOString(),
        }

        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
          import('@/lib/core/logger').then(({ logger }) => {
            logger.perf(trackId, renderTime, { trackId })
          })
        }

        // Call custom callback if provided
        if (onPerformanceMetrics) {
          onPerformanceMetrics(newMetrics)
        }

        // Send to analytics service if available
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'component_performance', {
            custom_map: {
              dimension1: 'component_id',
              metric1: 'render_time_ms',
            },
            component_id: trackId,
            render_time_ms: Math.round(renderTime),
          })
        }
      }
    }
  }, [trackId, onPerformanceMetrics])

  return <>{children}</>
}

// Resource loading tracker
export const ResourceTracker = ({
  resources = [],
}: ResourceTrackerProps): ResourceTrackerReturn => {
  const loadedResourcesRef = useRef<ResourceMetrics[]>([])
  const loadingResourcesRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        if (resources.includes(entry.name)) {
          const performanceEntry = entry as PerformanceResourceTiming
          loadedResourcesRef.current = [
            ...loadedResourcesRef.current.filter((r) => r.name !== entry.name),
            {
              name: entry.name,
              loadTime: Math.round(entry.duration * 100) / 100,
              size: performanceEntry.transferSize || 0,
              timestamp: new Date().toISOString(),
            },
          ]
          loadingResourcesRef.current.delete(entry.name)
        }
      })
    })

    observer.observe({ entryTypes: ['resource'] })

    return () => observer.disconnect()
  }, [resources])

  return {
    loadedResources: loadedResourcesRef.current,
    loadingResources: loadingResourcesRef.current,
  }
}

// Route change performance tracker
export const RoutePerformanceTracker = () => {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Track page load
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming
      if (navigation) {
        const loadTime = Math.round(navigation.loadEventEnd - navigation.fetchStart)

        console.log('Page Load Performance:', {
          domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.fetchStart),
          loadComplete: loadTime,
          firstPaint:
            performance.getEntriesByType('paint').find((entry) => entry.name === 'first-paint')
              ?.startTime || 0,
          firstContentfulPaint:
            performance
              .getEntriesByType('paint')
              .find((entry) => entry.name === 'first-contentful-paint')?.startTime || 0,
        })
      }

      // Track route changes
      const originalPushState = history.pushState
      const originalReplaceState = history.replaceState

      history.pushState = function (data: any, unused: string, url?: string | URL | null) {
        const startTime = performance.now()
        originalPushState.call(history, data, unused, url)

        setTimeout(() => {
          const routeChangeTime = Math.round(performance.now() - startTime)
          console.log('Route Change Performance:', { routeChangeTime, path: url })
        }, 0)
      }

      history.replaceState = function (data: any, unused: string, url?: string | URL | null) {
        const startTime = performance.now()
        originalReplaceState.call(history, data, unused, url)

        setTimeout(() => {
          const routeChangeTime = Math.round(performance.now() - startTime)
          console.log('Route Replace Performance:', { routeChangeTime, path: url })
        }, 0)
      }

      return () => {
        history.pushState = originalPushState
        history.replaceState = originalReplaceState
      }
    }
  }, [])

  return null
}

interface WebVital {
  name: string
  value: number
  rating?: string
  delta?: number
  id: string
}

interface PerformanceEntryWithWebVital extends PerformanceEntry {
  value: number
  rating?: string
  delta?: number
  id: string
  getEntries?: () => WebVital[]
}

// Web Vitals tracker
export const WebVitalsTracker = () => {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const reportWebVitals = (onPerfEntry: PerformanceEntryWithWebVital) => {
        if (onPerfEntry && onPerfEntry.getEntries) {
          onPerfEntry.getEntries().forEach((entry) => {
            const metric = {
              name: entry.name,
              value: Math.round(entry.value * 100) / 100,
              rating: entry.rating,
              delta: entry.delta,
              id: entry.id,
              timestamp: new Date().toISOString(),
            }

            console.log(`Web Vital [${entry.name}]:`, metric)

            // Send to analytics
            if (window.gtag) {
              window.gtag('event', entry.name, {
                event_category: 'Web Vitals',
                event_label: entry.id,
                value: Math.round(entry.name === 'CLS' ? entry.value * 1000 : entry.value),
                non_interaction: true,
                custom_map: {
                  dimension1: 'web_vital_name',
                  dimension2: 'web_vital_rating',
                  metric1: 'web_vital_value',
                },
                web_vital_name: entry.name,
                web_vital_rating: entry.rating,
                web_vital_value: Math.round(
                  entry.name === 'CLS' ? entry.value * 1000 : entry.value
                ),
              })
            }
          })
        }
      }

      // Import and use web-vitals library
      import('web-vitals')
        .then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
          onCLS(reportWebVitals as any)
          onINP(reportWebVitals as any)
          onFCP(reportWebVitals as any)
          onLCP(reportWebVitals as any)
          onTTFB(reportWebVitals as any)
        })
        .catch(console.error)
    }
  }, [])

  return null
}
