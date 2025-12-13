import React, { useState, useEffect, ReactNode, ComponentType, ReactElement } from 'react'
import dynamic, { DynamicOptions, Loader } from 'next/dynamic'

interface LazyLoadingOptions<_P = any> {
  loadingComponent?: ReactNode
  preload?: boolean
}

// Higher-order component for lazy loading
export const withLazyLoading = <P extends object>(
  importFunc: Loader<P>,
  { loadingComponent = null, preload = false }: LazyLoadingOptions<P> = {}
): ComponentType<P> => {
  const LazyComponent = dynamic<P>(importFunc, {
    loading: () => (loadingComponent as ReactElement) || <DefaultLoading />,
    ssr: false, // Disable server-side rendering for better code splitting
  } as DynamicOptions<P>)

  // Preload the component if requested
  if (preload && typeof window !== 'undefined') {
    if (typeof importFunc === 'function') {
      importFunc()
    }
  }

  return LazyComponent as ComponentType<P>
}

// Default loading component
const DefaultLoading = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
    <span className="ml-2 text-gray-600 dark:text-gray-400">Loading...</span>
  </div>
)

// Default error component (available for export if needed)
export const DefaultError = () => (
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

interface LazyLoadComponentProps {
  children: ReactNode
  rootMargin?: string
  threshold?: number
  fallback?: ReactNode
}

// Intersection Observer based lazy loader
export const LazyLoadComponent = ({
  children,
  rootMargin = '50px',
  threshold = 0.1,
  fallback = <DefaultLoading />,
}: LazyLoadComponentProps) => {
  const [isInView, setIsInView] = useState(false)
  const [elementRef, setElementRef] = useState<HTMLDivElement | null>(null)

  // Use Intersection Observer for lazy loading
  useEffect(() => {
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
