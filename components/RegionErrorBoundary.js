import React from 'react'
import ErrorBoundary from './ErrorBoundary'

// Regional boundary wrapper for finer-grained error isolation
// Usage: wrap smaller UI regions to avoid whole-page fallback
export default function RegionErrorBoundary({ children, label = '模块' }) {
  return (
    <ErrorBoundary>
      <div aria-live="polite" aria-label={`${label}区域`}>
        {children}
      </div>
    </ErrorBoundary>
  )
}
