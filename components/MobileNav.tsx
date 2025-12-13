import {
  useState,
  useEffect,
  useRef,
  useCallback,
  KeyboardEvent as ReactKeyboardEvent,
} from 'react'
import Link from './Link'
import headerNavLinks from '@/data/headerNavLinks'
import { trapFocus } from '@/lib/focus-management'
import { announceToScreenReader } from '@/lib/focus-management'

const MobileNav = () => {
  const [navShow, setNavShow] = useState(false)
  const [mounted, setMounted] = useState(false)
  const navRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Focus management for mobile navigation
  useEffect(() => {
    if (navShow && navRef.current) {
      const cleanup = trapFocus(navRef.current)

      // Announce to screen readers
      announceToScreenReader('Navigation menu opened')

      return cleanup
    }
    return undefined
  }, [navShow])

  const onToggleNav = useCallback(() => {
    setNavShow((status) => {
      const newState = !status

      if (mounted) {
        if (newState) {
          // Opening menu
          document.body.style.overflow = 'hidden'
          announceToScreenReader('Navigation menu opened')
        } else {
          // Closing menu
          document.body.style.overflow = 'auto'
          announceToScreenReader('Navigation menu closed')
        }
      }

      return newState
    })
  }, [mounted])

  // Handle escape key to close menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && navShow) {
        onToggleNav()
      }
    }

    if (navShow) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [navShow, onToggleNav])

  return (
    <div className="sm:hidden">
      <button
        type="button"
        className="ml-1 mr-1 h-8 w-8 rounded-sm p-1 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        aria-label="Toggle navigation menu"
        aria-expanded={navShow}
        aria-controls="mobile-navigation"
        onClick={onToggleNav}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-6 w-6"
        >
          {navShow ? (
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          ) : (
            <path
              fillRule="evenodd"
              d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
              clipRule="evenodd"
            />
          )}
        </svg>
      </button>

      {/* Navigation overlay */}
      <div
        id="mobile-navigation"
        ref={navRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-nav-title"
        className={`fixed inset-0 z-50 transform bg-gray-200 dark:bg-gray-900 transition-transform duration-300 ease-in-out ${
          navShow ? 'translate-x-0' : 'translate-x-full'
        }`}
        hidden={!navShow}
      >
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-300 dark:border-gray-700">
          <h2
            id="mobile-nav-title"
            className="text-lg font-semibold text-gray-900 dark:text-gray-100"
          >
            Navigation Menu
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            className="h-8 w-8 rounded-sm p-1 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            aria-label="Close navigation menu"
            onClick={onToggleNav}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-6 w-6"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        <nav
          className="h-full overflow-y-auto px-6 py-4"
          role="navigation"
          aria-label="Main navigation"
        >
          <ul className="space-y-4">
            {headerNavLinks.map((link) => (
              <li key={link.title}>
                <Link
                  href={link.href}
                  className="block text-xl font-medium tracking-wide text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-md py-2 px-3"
                  onClick={onToggleNav}
                  onKeyDown={(e: ReactKeyboardEvent<HTMLAnchorElement>) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      onToggleNav()
                    }
                  }}
                >
                  {link.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  )
}

export default MobileNav
