import { useEffect, useState, ReactNode } from 'react'
import {
  ReadingProgress,
  BackToTop,
  SmoothScroll,
  CopyCode,
  PrintButton,
  FontSizeAdjuster,
} from './UserExperience'

interface UserExperienceWrapperProps {
  children: ReactNode
  showReadingProgress?: boolean
  showBackToTop?: boolean
}

const UserExperienceWrapper = ({
  children,
  showReadingProgress = true,
  showBackToTop = true,
}: UserExperienceWrapperProps) => {
  const [showControls, setShowControls] = useState(false)
  const [isPrint, setIsPrint] = useState(false)

  useEffect(() => {
    // Check if we're in print mode
    const mediaQuery = window.matchMedia('print')
    const handleMediaChange = (e: MediaQueryListEvent) => setIsPrint(e.matches)

    mediaQuery.addEventListener('change', handleMediaChange)
    setIsPrint(mediaQuery.matches)

    // Show controls after a small delay to avoid layout shift
    const timer = setTimeout(() => setShowControls(true), 1000)

    // Add smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth'

    return () => {
      mediaQuery.removeEventListener('change', handleMediaChange)
      clearTimeout(timer)
      document.documentElement.style.scrollBehavior = ''
    }
  }, [])

  // Don't show controls in print mode
  if (isPrint) {
    return <>{children}</>
  }

  return (
    <>
      {showReadingProgress && <ReadingProgress target="main-content" />}
      <SmoothScroll />
      <CopyCode />

      {showControls && (
        <div className="fixed bottom-8 left-8 z-40 flex flex-col space-y-4">
          <FontSizeAdjuster className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700" />
          <PrintButton className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700" />
        </div>
      )}

      {showBackToTop && <BackToTop />}
      {children}
    </>
  )
}

export default UserExperienceWrapper
