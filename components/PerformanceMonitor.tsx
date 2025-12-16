import { useState, useEffect } from 'react'

interface Metrics {
  fps: number
  memory: number
  timing: number
}

interface PerformanceMemory {
  usedJSHeapSize: number
  totalJSHeapSize: number
  jsHeapSizeLimit: number
}

declare global {
  interface Performance {
    memory?: PerformanceMemory
  }
}

const PerformanceMonitor = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [metrics, setMetrics] = useState<Metrics>({
    fps: 0,
    memory: 0,
    timing: 0,
  })

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Shift + P to toggle performance monitor
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
        e.preventDefault()
        setIsVisible((prev) => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (!isVisible || process.env.NODE_ENV !== 'development') return

    let frameCount = 0
    let lastTime = performance.now()
    let animationFrameId: number

    const measureFPS = () => {
      frameCount++
      const currentTime = performance.now()

      if (currentTime >= lastTime + 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime))
        setMetrics((prev) => ({ ...prev, fps }))
        frameCount = 0
        lastTime = currentTime
      }

      if (isVisible) {
        animationFrameId = requestAnimationFrame(measureFPS)
      }
    }

    animationFrameId = requestAnimationFrame(measureFPS)

    const measureMemory = () => {
      if (performance.memory) {
        setMetrics((prev) => ({
          ...prev,
          memory: Math.round(performance.memory!.usedJSHeapSize / 1048576),
        }))
      }
    }

    const interval = setInterval(measureMemory, 1000)

    return () => {
      clearInterval(interval)
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [isVisible])

  useEffect(() => {
    if (!isVisible || process.env.NODE_ENV !== 'development') return

    const measureTiming = () => {
      const timing = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (timing) {
        setMetrics((prev) => ({
          ...prev,
          timing: Math.round(timing.loadEventEnd - timing.loadEventStart),
        }))
      }
    }

    measureTiming()
  }, [isVisible])

  if (!isVisible || process.env.NODE_ENV !== 'development') return null

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg shadow-lg z-50 text-xs">
      <div className="mb-2 font-bold">Performance Monitor</div>
      <div className="space-y-1">
        <div>FPS: {metrics.fps}</div>
        <div>Memory: {metrics.memory}MB</div>
        <div>Load Time: {metrics.timing}ms</div>
      </div>
      <div className="mt-2 text-gray-400">Press Ctrl+Shift+P to hide</div>
    </div>
  )
}

export default PerformanceMonitor
