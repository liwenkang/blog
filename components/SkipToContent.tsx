import { useState, useEffect, MouseEvent } from 'react'

const SkipToContent = () => {
  const [isFocused, setIsFocused] = useState(false)

  const handleSkip = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const mainContent = document.getElementById('main-content')
    if (mainContent) {
      mainContent.focus()
      mainContent.scrollIntoView({ behavior: 'smooth' })
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setIsFocused(true)
      }
    }

    const handleMouseDown = () => {
      setIsFocused(false)
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleMouseDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleMouseDown)
    }
  }, [])

  return (
    <a
      href="#main-content"
      onClick={handleSkip}
      className={`
        fixed top-0 left-0 z-50
        bg-white dark:bg-gray-900
        text-gray-900 dark:text-gray-100
        px-4 py-2
        -translate-y-full
        focus:translate-y-0
        border border-gray-300 dark:border-gray-600
        transition-transform duration-200
        ${isFocused ? 'translate-y-0' : ''}
      `}
    >
      Skip to main content
    </a>
  )
}

export default SkipToContent
