/**
 * Focus Management utilities for accessibility
 */
import { useEffect, useRef, RefObject } from 'react'

/**
 * Trap focus within a container element
 */
export function trapFocus(container: HTMLElement | null): () => void {
  if (!container) return () => {}

  const focusableElements = container.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )

  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement?.focus()
        e.preventDefault()
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement?.focus()
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
 */
export function useModalFocus(isOpen: boolean, modalRef: RefObject<HTMLElement>): void {
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (isOpen && modalRef.current) {
      // Store the currently focused element
      previousFocusRef.current = document.activeElement as HTMLElement

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
 */
export function announceToScreenReader(
  message: string,
  politeness: 'polite' | 'assertive' = 'polite'
): void {
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
 */
export function generateA11yId(prefix = 'a11y'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
}
