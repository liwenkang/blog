/**
 * 统一性能监控系统
 * 整合 PerformanceMonitor 和 PerformanceTracker 的功能
 */

import { logger } from './logger'

/**
 * 性能指标收集器
 */
export class PerformanceCollector {
  constructor() {
    this.metrics = new Map()
    this.observers = []
  }

  /**
   * 记录性能指标
   */
  record(name, value, metadata = {}) {
    const metric = {
      name,
      value: Math.round(value * 100) / 100,
      timestamp: Date.now(),
      metadata,
    }

    this.metrics.set(name, metric)
    logger.perf(name, value, metadata)

    // 发送到 Google Analytics（如果可用）
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'performance_metric', {
        event_category: 'Performance',
        event_label: name,
        value: Math.round(value),
        ...metadata,
      })
    }

    return metric
  }

  /**
   * 获取所有指标
   */
  getMetrics() {
    return Array.from(this.metrics.values())
  }

  /**
   * 清除指标
   */
  clear() {
    this.metrics.clear()
  }

  /**
   * 清理观察者
   */
  cleanup() {
    this.observers.forEach((observer) => observer.disconnect())
    this.observers = []
  }
}

// 单例
export const performanceCollector = new PerformanceCollector()

/**
 * 测量函数执行时间
 */
export function measure(name, fn) {
  const start = performance.now()
  const result = fn()

  if (result instanceof Promise) {
    return result.finally(() => {
      const duration = performance.now() - start
      performanceCollector.record(name, duration)
    })
  }

  const duration = performance.now() - start
  performanceCollector.record(name, duration)
  return result
}

/**
 * 测量异步函数执行时间
 */
export async function measureAsync(name, fn) {
  const start = performance.now()
  try {
    return await fn()
  } finally {
    const duration = performance.now() - start
    performanceCollector.record(name, duration)
  }
}

/**
 * 创建性能标记
 */
export function mark(name) {
  if (typeof performance !== 'undefined' && performance.mark) {
    performance.mark(name)
  }
}

/**
 * 测量两个标记之间的时间
 */
export function measureBetween(name, startMark, endMark) {
  if (typeof performance !== 'undefined' && performance.measure) {
    try {
      performance.measure(name, startMark, endMark)
      const measure = performance.getEntriesByName(name)[0]
      if (measure) {
        performanceCollector.record(name, measure.duration, {
          startMark,
          endMark,
        })
        return measure.duration
      }
    } catch (error) {
      logger.warn(`Failed to measure between ${startMark} and ${endMark}`, { error })
    }
  }
  return 0
}

/**
 * 监控组件渲染性能
 */
export function trackComponentRender(componentName, renderTime, metadata = {}) {
  performanceCollector.record(`component:${componentName}`, renderTime, {
    type: 'component_render',
    component: componentName,
    ...metadata,
  })
}

/**
 * 监控路由变化性能
 */
export function trackRouteChange(path, duration, metadata = {}) {
  performanceCollector.record('route:change', duration, {
    type: 'route_change',
    path,
    ...metadata,
  })
}

/**
 * 监控资源加载性能
 */
export function trackResourceLoad(resourceName, duration, size = 0) {
  performanceCollector.record(`resource:${resourceName}`, duration, {
    type: 'resource_load',
    resource: resourceName,
    size,
  })
}

/**
 * 获取页面加载性能指标
 */
export function getPageLoadMetrics() {
  if (typeof performance === 'undefined') return null

  const navigation = performance.getEntriesByType('navigation')[0]
  if (!navigation) return null

  const metrics = {
    // DNS 查询时间
    dns: Math.round(navigation.domainLookupEnd - navigation.domainLookupStart),

    // TCP 连接时间
    tcp: Math.round(navigation.connectEnd - navigation.connectStart),

    // 请求响应时间
    request: Math.round(navigation.responseEnd - navigation.requestStart),

    // DOM 解析时间
    domParse: Math.round(navigation.domInteractive - navigation.responseEnd),

    // DOM 内容加载完成时间
    domContentLoaded: Math.round(
      navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart
    ),

    // 资源加载时间
    resourceLoad: Math.round(navigation.loadEventStart - navigation.domContentLoadedEventEnd),

    // 页面完全加载时间
    pageLoad: Math.round(navigation.loadEventEnd - navigation.fetchStart),

    // 首次绘制时间
    firstPaint: getFirstPaint(),

    // 首次内容绘制时间
    firstContentfulPaint: getFirstContentfulPaint(),
  }

  // 记录所有指标
  Object.entries(metrics).forEach(([name, value]) => {
    if (value > 0) {
      performanceCollector.record(`page:${name}`, value, { type: 'page_load' })
    }
  })

  return metrics
}

/**
 * 获取首次绘制时间
 */
function getFirstPaint() {
  if (typeof performance === 'undefined') return 0

  const paintEntries = performance.getEntriesByType('paint')
  const fpEntry = paintEntries.find((entry) => entry.name === 'first-paint')
  return fpEntry ? Math.round(fpEntry.startTime) : 0
}

/**
 * 获取首次内容绘制时间
 */
function getFirstContentfulPaint() {
  if (typeof performance === 'undefined') return 0

  const paintEntries = performance.getEntriesByType('paint')
  const fcpEntry = paintEntries.find((entry) => entry.name === 'first-contentful-paint')
  return fcpEntry ? Math.round(fcpEntry.startTime) : 0
}

/**
 * 监控 Web Vitals
 */
export async function trackWebVitals() {
  if (typeof window === 'undefined') return

  try {
    const { getCLS, getFID, getFCP, getLCP, getTTFB, onINP } = await import('web-vitals')

    const reportMetric = (metric) => {
      const value = Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value)

      performanceCollector.record(`webvital:${metric.name}`, value, {
        type: 'web_vital',
        rating: metric.rating,
        delta: metric.delta,
        id: metric.id,
      })

      // 发送到 Google Analytics
      if (window.gtag) {
        window.gtag('event', metric.name, {
          event_category: 'Web Vitals',
          event_label: metric.id,
          value,
          non_interaction: true,
        })
      }
    }

    getCLS(reportMetric)
    getFID(reportMetric)
    getFCP(reportMetric)
    getLCP(reportMetric)
    getTTFB(reportMetric)

    // INP (Interaction to Next Paint) - 新指标
    if (onINP) {
      onINP(reportMetric)
    }
  } catch (error) {
    logger.warn('Failed to track Web Vitals', { error: error.message })
  }
}

/**
 * 监控内存使用
 */
export function getMemoryUsage() {
  if (typeof performance === 'undefined' || !performance.memory) return null

  const memory = {
    usedJSHeapSize: Math.round(performance.memory.usedJSHeapSize / 1048576), // MB
    totalJSHeapSize: Math.round(performance.memory.totalJSHeapSize / 1048576), // MB
    jsHeapSizeLimit: Math.round(performance.memory.jsHeapSizeLimit / 1048576), // MB
    usagePercent: Math.round(
      (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100
    ),
  }

  performanceCollector.record('memory:usage', memory.usedJSHeapSize, {
    type: 'memory',
    ...memory,
  })

  return memory
}

/**
 * 监控 FPS
 */
export function trackFPS(callback) {
  if (typeof window === 'undefined') return () => {}

  let frameCount = 0
  let lastTime = performance.now()
  let rafId = null

  const measureFPS = () => {
    frameCount++
    const currentTime = performance.now()

    if (currentTime >= lastTime + 1000) {
      const fps = Math.round((frameCount * 1000) / (currentTime - lastTime))
      performanceCollector.record('fps', fps, { type: 'fps' })

      if (callback) {
        callback(fps)
      }

      frameCount = 0
      lastTime = currentTime
    }

    rafId = requestAnimationFrame(measureFPS)
  }

  rafId = requestAnimationFrame(measureFPS)

  // 返回清理函数
  return () => {
    if (rafId) {
      cancelAnimationFrame(rafId)
    }
  }
}

/**
 * 性能报告
 */
export function getPerformanceReport() {
  const metrics = performanceCollector.getMetrics()

  const report = {
    timestamp: new Date().toISOString(),
    metrics: metrics.reduce((acc, metric) => {
      acc[metric.name] = {
        value: metric.value,
        metadata: metric.metadata,
      }
      return acc
    }, {}),
    summary: {
      totalMetrics: metrics.length,
      categories: {},
    },
  }

  // 按类型分类
  metrics.forEach((metric) => {
    const type = metric.metadata?.type || 'other'
    if (!report.summary.categories[type]) {
      report.summary.categories[type] = 0
    }
    report.summary.categories[type]++
  })

  return report
}

export default {
  performanceCollector,
  measure,
  measureAsync,
  mark,
  measureBetween,
  trackComponentRender,
  trackRouteChange,
  trackResourceLoad,
  getPageLoadMetrics,
  trackWebVitals,
  getMemoryUsage,
  trackFPS,
  getPerformanceReport,
}
