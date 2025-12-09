import React, { useState, Suspense } from 'react'
import dynamic from 'next/dynamic'

// Higher-order component for lazy loading
export const withLazyLoading = (
  importFunc,
  { fallback = null, loadingComponent = null, errorComponent = null, preload = false } = {}
) => {
  const LazyComponent = dynamic(importFunc, {
    loading: () => loadingComponent || <DefaultLoading />,
    onError: () => errorComponent || <DefaultError />,
    ssr: false, // Disable server-side rendering for better code splitting
  })

  // Preload the component if requested
  if (preload && typeof window !== 'undefined') {
    importFunc()
  }

  return LazyComponent
}

// Default loading component
const DefaultLoading = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
    <span className="ml-2 text-gray-600 dark:text-gray-400">Loading...</span>
  </div>
)

// Default error component
const DefaultError = () => (
  <div className="flex items-center justify-center p-8 text-center">
    <div>
      <svg
        className="w-12 h-12 mx-auto text-red-500 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
        />
      </svg>
      <p className="text-gray-600 dark:text-gray-400">Failed to load component</p>
    </div>
  </div>
)

// Intersection Observer based lazy loader
export const LazyLoadComponent = ({
  children,
  rootMargin = '50px',
  threshold = 0.1,
  fallback = <DefaultLoading />,
}) => {
  const [isInView, setIsInView] = useState(false)
  const [elementRef, setElementRef] = useState(null)

  // Use Intersection Observer for lazy loading
  React.useEffect(() => {
    if (!elementRef || typeof window === 'undefined') return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        rootMargin,
        threshold,
      }
    )

    observer.observe(elementRef)

    return () => observer.disconnect()
  }, [elementRef, rootMargin, threshold])

  return <div ref={setElementRef}>{isInView ? children : fallback}</div>
}
