/**
 * 性能监控面板 V2
 * 整合所有性能监控功能，使用新的性能系统
 */

import React, { useState, useEffect, useCallback } from 'react'
import {
  performanceCollector,
  getPageLoadMetrics,
  getMemoryUsage,
  trackFPS,
  getPerformanceReport,
} from '@/lib/core/performance'

const PerformanceMonitorV2 = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [metrics, setMetrics] = useState({
    fps: 0,
    memory: { usedJSHeapSize: 0, usagePercent: 0 },
    pageLoad: null,
    recentMetrics: [],
  })

  // 切换显示/隐藏
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return

    const handleKeyDown = (e) => {
      // Ctrl/Cmd + Shift + P 切换性能监控面板
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
        e.preventDefault()
        setIsVisible((prev) => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // 监控 FPS
  useEffect(() => {
    if (!isVisible || process.env.NODE_ENV !== 'development') return

    const cleanup = trackFPS((fps) => {
      setMetrics((prev) => ({ ...prev, fps }))
    })

    return cleanup
  }, [isVisible])

  // 监控内存和页面加载指标
  useEffect(() => {
    if (!isVisible || process.env.NODE_ENV !== 'development') return

    // 立即获取页面加载指标
    const pageLoadMetrics = getPageLoadMetrics()
    if (pageLoadMetrics) {
      setMetrics((prev) => ({ ...prev, pageLoad: pageLoadMetrics }))
    }

    // 定期更新内存和最近指标
    const interval = setInterval(() => {
      const memory = getMemoryUsage()
      if (memory) {
        setMetrics((prev) => ({ ...prev, memory }))
      }

      // 获取最近的性能指标
      const allMetrics = performanceCollector.getMetrics()
      const recent = allMetrics
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 10)
        .map((m) => ({
          name: m.name,
          value: m.value,
          type: m.metadata?.type || 'other',
        }))

      setMetrics((prev) => ({ ...prev, recentMetrics: recent }))
    }, 1000)

    return () => clearInterval(interval)
  }, [isVisible])

  // 导出性能报告
  const exportReport = useCallback(() => {
    const report = getPerformanceReport()
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `performance-report-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [])

  // 清除指标
  const clearMetrics = useCallback(() => {
    performanceCollector.clear()
    setMetrics((prev) => ({ ...prev, recentMetrics: [] }))
  }, [])

  if (!isVisible || process.env.NODE_ENV !== 'development') return null

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 bg-opacity-95 text-white p-4 rounded-lg shadow-2xl z-50 text-xs max-w-md max-h-96 overflow-y-auto">
      {/* 标题栏 */}
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-700">
        <div className="font-bold text-sm">⚡ Performance Monitor</div>
        <div className="flex gap-2">
          <button
            onClick={exportReport}
            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs transition-colors"
            title="Export Report"
          >
            📥
          </button>
          <button
            onClick={clearMetrics}
            className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs transition-colors"
            title="Clear Metrics"
          >
            🗑️
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs transition-colors"
            title="Close"
          >
            ✕
          </button>
        </div>
      </div>

      {/* 实时指标 */}
      <div className="space-y-3">
        {/* FPS 和内存 */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-800 p-2 rounded">
            <div className="text-gray-400 mb-1">FPS</div>
            <div
              className={`text-lg font-bold ${
                metrics.fps >= 60
                  ? 'text-green-400'
                  : metrics.fps >= 30
                    ? 'text-yellow-400'
                    : 'text-red-400'
              }`}
            >
              {metrics.fps}
            </div>
          </div>
          <div className="bg-gray-800 p-2 rounded">
            <div className="text-gray-400 mb-1">Memory</div>
            <div
              className={`text-lg font-bold ${
                metrics.memory.usagePercent < 70
                  ? 'text-green-400'
                  : metrics.memory.usagePercent < 85
                    ? 'text-yellow-400'
                    : 'text-red-400'
              }`}
            >
              {metrics.memory.usedJSHeapSize}MB
            </div>
            <div className="text-xs text-gray-500">{metrics.memory.usagePercent}%</div>
          </div>
        </div>

        {/* 页面加载指标 */}
        {metrics.pageLoad && (
          <div className="bg-gray-800 p-2 rounded">
            <div className="text-gray-400 mb-2 font-semibold">Page Load</div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
              <div className="text-gray-500">DNS:</div>
              <div className="text-right">{metrics.pageLoad.dns}ms</div>

              <div className="text-gray-500">TCP:</div>
              <div className="text-right">{metrics.pageLoad.tcp}ms</div>

              <div className="text-gray-500">Request:</div>
              <div className="text-right">{metrics.pageLoad.request}ms</div>

              <div className="text-gray-500">DOM Parse:</div>
              <div className="text-right">{metrics.pageLoad.domParse}ms</div>

              <div className="text-gray-500">FCP:</div>
              <div className="text-right font-semibold text-blue-400">
                {metrics.pageLoad.firstContentfulPaint}ms
              </div>

              <div className="text-gray-500">Total:</div>
              <div className="text-right font-bold text-green-400">
                {metrics.pageLoad.pageLoad}ms
              </div>
            </div>
          </div>
        )}

        {/* 最近的性能指标 */}
        {metrics.recentMetrics.length > 0 && (
          <div className="bg-gray-800 p-2 rounded">
            <div className="text-gray-400 mb-2 font-semibold">Recent Metrics</div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {metrics.recentMetrics.map((metric, index) => (
                <div
                  key={`${metric.name}-${index}`}
                  className="flex justify-between items-center text-xs"
                >
                  <span className="text-gray-300 truncate flex-1" title={metric.name}>
                    {metric.name}
                  </span>
                  <span className="text-gray-400 ml-2">
                    {metric.value}
                    {metric.name.includes('memory') ? 'MB' : 'ms'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 快捷键提示 */}
      <div className="mt-3 pt-2 border-t border-gray-700 text-gray-500 text-xs">
        <div>Ctrl/Cmd + Shift + P to toggle</div>
      </div>
    </div>
  )
}

export default PerformanceMonitorV2
