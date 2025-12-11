/**
 * 性能监控 React Hooks
 */

import { useEffect, useRef, useCallback } from 'react'
import {
  trackComponentRender,
  trackRouteChange,
  measure,
  measureAsync,
} from '@/lib/core/performance'

/**
 * 监控组件渲染性能
 * @param {string} componentName - 组件名称
 * @param {Object} options - 配置选项
 */
export function usePerformanceTracker(componentName, options = {}) {
  const { enabled = process.env.NODE_ENV === 'development', metadata = {} } = options
  const startTimeRef = useRef(null)
  const mountedRef = useRef(false)

  useEffect(() => {
    if (!enabled) return

    // 首次渲染
    if (!mountedRef.current) {
      startTimeRef.current = performance.now()
      mountedRef.current = true
      return
    }

    // 后续渲染（更新）
    if (startTimeRef.current) {
      const renderTime = performance.now() - startTimeRef.current
      trackComponentRender(componentName, renderTime, {
        ...metadata,
        renderType: 'update',
      })
    }

    startTimeRef.current = performance.now()
  })

  useEffect(() => {
    if (!enabled) return

    // 组件挂载完成
    if (startTimeRef.current) {
      const mountTime = performance.now() - startTimeRef.current
      trackComponentRender(componentName, mountTime, {
        ...metadata,
        renderType: 'mount',
      })
    }
  }, [enabled, componentName, metadata])
}

/**
 * 监控路由变化性能
 */
export function useRoutePerformance() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    let routeStartTime = performance.now()

    const handleRouteChangeStart = () => {
      routeStartTime = performance.now()
    }

    const handleRouteChangeComplete = (url) => {
      const duration = performance.now() - routeStartTime
      trackRouteChange(url, duration)
    }

    // Next.js 路由事件
    const Router = require('next/router').default

    Router.events.on('routeChangeStart', handleRouteChangeStart)
    Router.events.on('routeChangeComplete', handleRouteChangeComplete)

    return () => {
      Router.events.off('routeChangeStart', handleRouteChangeStart)
      Router.events.off('routeChangeComplete', handleRouteChangeComplete)
    }
  }, [])
}

/**
 * 测量函数执行时间的 Hook
 * @param {string} name - 测量名称
 */
export function useMeasure(name) {
  const measureSync = useCallback(
    (fn) => {
      return measure(name, fn)
    },
    [name]
  )

  const measureAsync = useCallback(
    async (fn) => {
      return await measureAsync(name, fn)
    },
    [name]
  )

  return { measure: measureSync, measureAsync }
}

/**
 * 监控数据获取性能
 * @param {string} key - 唯一标识
 * @param {Function} fetcher - 数据获取函数
 * @param {Array} deps - 依赖数组
 */
export function useDataFetchPerformance(key, fetcher, deps = []) {
  useEffect(() => {
    if (!fetcher) return

    const startTime = performance.now()

    const fetchData = async () => {
      try {
        await fetcher()
      } finally {
        const duration = performance.now() - startTime
        measure(`data:${key}`, () => duration)
      }
    }

    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

/**
 * 监控图片加载性能
 * @param {string} src - 图片地址
 */
export function useImageLoadPerformance(src) {
  useEffect(() => {
    if (!src || typeof window === 'undefined') return

    const startTime = performance.now()

    const img = new Image()
    img.src = src

    const handleLoad = () => {
      const duration = performance.now() - startTime
      measure(`image:${src}`, () => duration)
    }

    const handleError = () => {
      const duration = performance.now() - startTime
      measure(`image:error:${src}`, () => duration)
    }

    img.addEventListener('load', handleLoad)
    img.addEventListener('error', handleError)

    return () => {
      img.removeEventListener('load', handleLoad)
      img.removeEventListener('error', handleError)
    }
  }, [src])
}

/**
 * 监控长任务（Long Tasks）
 */
export function useLongTaskDetector(threshold = 50) {
  useEffect(() => {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > threshold) {
            measure(`longtask:${entry.name}`, () => entry.duration)
          }
        }
      })

      observer.observe({ entryTypes: ['longtask'] })

      return () => observer.disconnect()
    } catch (error) {
      // Long Task API 可能不被支持
      console.warn('Long Task API not supported')
    }
  }, [threshold])
}

/**
 * 页面可见性性能追踪
 */
export function usePageVisibilityPerformance() {
  useEffect(() => {
    if (typeof document === 'undefined') return

    let visibilityStartTime = performance.now()

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // 页面隐藏
        visibilityStartTime = performance.now()
      } else {
        // 页面显示
        const hiddenDuration = performance.now() - visibilityStartTime
        measure('page:hidden-duration', () => hiddenDuration)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])
}

/**
 * 滚动性能监控
 */
export function useScrollPerformance(throttle = 100) {
  useEffect(() => {
    if (typeof window === 'undefined') return

    let scrollCount = 0
    let lastScrollTime = performance.now()
    let timeoutId = null

    const handleScroll = () => {
      scrollCount++

      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        const duration = performance.now() - lastScrollTime
        measure('scroll:session', () => duration)
        measure('scroll:count', () => scrollCount)

        scrollCount = 0
        lastScrollTime = performance.now()
      }, throttle)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearTimeout(timeoutId)
    }
  }, [throttle])
}

export default {
  usePerformanceTracker,
  useRoutePerformance,
  useMeasure,
  useDataFetchPerformance,
  useImageLoadPerformance,
  useLongTaskDetector,
  usePageVisibilityPerformance,
  useScrollPerformance,
}
