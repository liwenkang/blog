/**
 * Focus Management utilities for accessibility
 */

/**
 * Trap focus within a container element
 * @param {HTMLElement} container - The container element
 * @returns {() => void} Cleanup function
 */
export function trapFocus(container) {
  if (!container) return () => {}

  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )

  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]

  const handleTabKey = (e) => {
    if (e.key !== 'Tab') return

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus()
        e.preventDefault()
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus()
        e.preventDefault()
      }
    }
  }

  container.addEventListener('keydown', handleTabKey)

  // Initially focus the first element
  if (firstElement) {
    firstElement.focus()
  }

  return () => {
    container.removeEventListener('keydown', handleTabKey)
  }
}

/**
 * Manage focus for modals and dialogs
 * @param {boolean} isOpen - Whether the modal is open
 * @param {HTMLElement} modalRef - Reference to the modal element
 */
export function useModalFocus(isOpen, modalRef) {
  const previousFocusRef = { current: null }

  useEffect(() => {
    if (isOpen && modalRef.current) {
      // Store the currently focused element
      previousFocusRef.current = document.activeElement

      // Trap focus within the modal
      const cleanup = trapFocus(modalRef.current)

      return () => {
        cleanup()
        // Restore focus to the previous element
        if (previousFocusRef.current) {
          previousFocusRef.current.focus()
        }
      }
    }
  }, [isOpen, modalRef])
}

/**
 * Announce messages to screen readers
 * @param {string} message - The message to announce
 * @param {string} politeness - Politeness level ('polite' or 'assertive')
 */
export function announceToScreenReader(message, politeness = 'polite') {
  // Create or get the live region element
  let liveRegion = document.getElementById('a11y-live-region')

  if (!liveRegion) {
    liveRegion = document.createElement('div')
    liveRegion.id = 'a11y-live-region'
    liveRegion.setAttribute('aria-live', politeness)
    liveRegion.setAttribute('aria-atomic', 'true')
    liveRegion.style.position = 'absolute'
    liveRegion.style.left = '-10000px'
    liveRegion.style.width = '1px'
    liveRegion.style.height = '1px'
    liveRegion.style.overflow = 'hidden'
    document.body.appendChild(liveRegion)
  }

  // Update the live region
  liveRegion.textContent = message
}

/**
 * Generate unique IDs for accessibility purposes
 * @param {string} prefix - Prefix for the ID
 * @returns {string} Unique ID
 */
export function generateA11yId(prefix = 'a11y') {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
}
