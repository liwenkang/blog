import { useState, useEffect, useCallback, useRef } from 'react'
import { useTheme } from 'next-themes'

// Reading progress indicator
export const ReadingProgress = ({ target }) => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const targetElement = document.getElementById(target)
      if (!targetElement) return

      const windowHeight = window.innerHeight
      const documentHeight = targetElement.scrollHeight
      const scrollTop = window.scrollY
      const targetTop = targetElement.offsetTop

      // Calculate progress only when target is in view
      if (scrollTop >= targetTop) {
        const scrolled = scrollTop - targetTop
        const total = documentHeight - windowHeight - targetTop
        const progressPercentage = Math.min((scrolled / total) * 100, 100)
        setProgress(Math.round(progressPercentage))
      } else {
        setProgress(0)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [target])

  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700 z-50">
      <div
        className="h-full bg-primary-500 transition-all duration-150 ease-out"
        style={{ width: `${progress}%` }}
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  )
}

// Back to top button
export const BackToTop = ({ threshold = 300 }) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > threshold)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [threshold])

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }, [])

  if (!isVisible) return null

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-8 right-8 p-3 bg-primary-500 text-white rounded-full shadow-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-110 z-40"
      aria-label="Back to top"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 10l7-7m0 0l7 7m-7-7v18"
        />
      </svg>
    </button>
  )
}

// Table of contents auto-highlight
export const TOCAutoHighlight = ({ headings, activeHeading, setActiveHeading }) => {
  const headingRefs = useRef([])

  useEffect(() => {
    headingRefs.current = headingRefs.current.slice(0, headings.length)

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = headingRefs.current.indexOf(entry.target)
            if (index !== -1) {
              setActiveHeading(index)
            }
          }
        })
      },
      {
        rootMargin: '-20% 0px -70% 0px',
      }
    )

    headings.forEach((_, index) => {
      const heading = document.getElementById(`heading-${index}`)
      if (heading) {
        headingRefs.current[index] = heading
        observer.observe(heading)
      }
    })

    return () => observer.disconnect()
  }, [headings, setActiveHeading])

  return null
}

// Smooth scroll for anchor links
export const SmoothScroll = () => {
  useEffect(() => {
    const handleAnchorClick = (e) => {
      const target = e.target.closest('a[href^="#"]')
      if (!target) return

      e.preventDefault()
      const targetId = target.getAttribute('href')
      const targetElement = document.querySelector(targetId)

      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
      }
    }

    document.addEventListener('click', handleAnchorClick)
    return () => document.removeEventListener('click', handleAnchorClick)
  }, [])

  return null
}

// Copy code block functionality
export const CopyCode = () => {
  useEffect(() => {
    const addCopyButtons = () => {
      const codeBlocks = document.querySelectorAll('pre code')

      codeBlocks.forEach((codeBlock) => {
        const pre = codeBlock.parentElement
        if (pre.querySelector('.copy-button')) return

        const button = document.createElement('button')
        button.className =
          'copy-button absolute top-2 right-2 px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors duration-200'
        button.innerHTML = 'Copy'

        button.addEventListener('click', async () => {
          const text = codeBlock.textContent
          try {
            await navigator.clipboard.writeText(text)
            button.innerHTML = 'Copied!'
            button.classList.add('bg-green-600', 'hover:bg-green-500')
            button.classList.remove('bg-gray-700', 'hover:bg-gray-600')

            setTimeout(() => {
              button.innerHTML = 'Copy'
              button.classList.remove('bg-green-600', 'hover:bg-green-500')
              button.classList.add('bg-gray-700', 'hover:bg-gray-600')
            }, 2000)
          } catch (err) {
            console.error('Failed to copy text: ', err)
          }
        })

        pre.classList.add('relative')
        pre.appendChild(button)
      })
    }

    // Add copy buttons after page load
    addCopyButtons()

    // Watch for dynamic content
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
          addCopyButtons()
        }
      })
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    return () => observer.disconnect()
  }, [])

  return null
}

// Print functionality
export const PrintButton = ({ className = '' }) => {
  const handlePrint = useCallback(() => {
    window.print()
  }, [])

  return (
    <button
      onClick={handlePrint}
      className={`print-btn p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded transition-colors duration-200 ${className}`}
      aria-label="Print page"
      title="Print page"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
        />
      </svg>
    </button>
  )
}

// Reading time estimator
export const ReadingTimeEstimator = ({ content, className = '' }) => {
  const [readingTime, setReadingTime] = useState({ minutes: 0, seconds: 0 })

  useEffect(() => {
    if (!content) return

    const calculateReadingTime = (text) => {
      // Average reading speed: 200-250 words per minute
      const wordsPerMinute = 225
      const wordsPerSecond = wordsPerMinute / 60

      // Count words (handles multiple spaces and newlines)
      const words = text.trim().split(/\s+/).length
      const totalSeconds = Math.ceil(words / wordsPerSecond)

      return {
        minutes: Math.floor(totalSeconds / 60),
        seconds: totalSeconds % 60,
      }
    }

    const time = calculateReadingTime(content)
    setReadingTime(time)
  }, [content])

  if (readingTime.minutes === 0) return null

  return (
    <div className={`text-sm text-gray-600 dark:text-gray-400 ${className}`}>
      <svg
        className="inline-block w-4 h-4 mr-1"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      {readingTime.minutes} min read
    </div>
  )
}

// Font size adjuster
export const FontSizeAdjuster = ({ className = '' }) => {
  const [fontSize, setFontSize] = useState('base')

  useEffect(() => {
    const savedSize = localStorage.getItem('blog-font-size') || 'base'
    setFontSize(savedSize)
    document.documentElement.classList.add(`text-${savedSize}`)
  }, [])

  const adjustFontSize = useCallback((size) => {
    // Remove existing font size classes
    document.documentElement.classList.remove('text-sm', 'text-base', 'text-lg', 'text-xl')

    // Add new font size class
    if (size !== 'base') {
      document.documentElement.classList.add(`text-${size}`)
    }

    setFontSize(size)
    localStorage.setItem('blog-font-size', size)
  }, [])

  const sizes = [
    { name: 'Small', value: 'sm', icon: 'A-' },
    { name: 'Base', value: 'base', icon: 'A' },
    { name: 'Large', value: 'lg', icon: 'A+' },
    { name: 'XL', value: 'xl', icon: 'A++' },
  ]

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <span className="text-sm text-gray-600 dark:text-gray-400">Font size:</span>
      <div className="flex space-x-1">
        {sizes.map((size) => (
          <button
            key={size.value}
            onClick={() => adjustFontSize(size.value)}
            className={`px-2 py-1 text-xs font-mono rounded transition-colors duration-200 ${
              fontSize === size.value
                ? 'bg-primary-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
            title={size.name}
            aria-label={`Set font size to ${size.name}`}
          >
            {size.icon}
          </button>
        ))}
      </div>
    </div>
  )
}

// Lazy load images helper
export const useImageLazyLoad = () => {
  const [loadedImages, setLoadedImages] = useState(new Set())

  const markImageLoaded = useCallback((src) => {
    setLoadedImages((prev) => new Set(prev).add(src))
  }, [])

  const isImageLoaded = useCallback(
    (src) => {
      return loadedImages.has(src)
    },
    [loadedImages]
  )

  return { markImageLoaded, isImageLoaded }
}
