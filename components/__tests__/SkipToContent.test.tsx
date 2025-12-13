import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SkipToContent from '../SkipToContent'

// Mock scrollIntoView
Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
  value: jest.fn(),
})

describe('SkipToContent Component', () => {
  beforeEach(() => {
    // Create a mock main-content element
    const mainContent = document.createElement('div')
    mainContent.id = 'main-content'
    mainContent.tabIndex = -1
    document.body.appendChild(mainContent)

    // Clear mock calls
    jest.clearAllMocks()
  })

  afterEach(() => {
    // Clean up
    document.body.innerHTML = ''
  })

  it('renders skip link with correct text', () => {
    render(<SkipToContent />)

    const skipLink = screen.getByRole('link', { name: /skip to main content/i })
    expect(skipLink).toBeInTheDocument()
    expect(skipLink).toHaveAttribute('href', '#main-content')
  })

  it('has proper accessibility attributes', () => {
    render(<SkipToContent />)

    const skipLink = screen.getByRole('link', { name: /skip to main content/i })
    // Check for key positioning classes
    expect(skipLink.className).toContain('fixed')
    expect(skipLink.className).toContain('top-0')
    expect(skipLink.className).toContain('left-0')
  })

  it('has proper focus styles', () => {
    render(<SkipToContent />)

    const skipLink = screen.getByRole('link', { name: /skip to main content/i })
    // Check for Tailwind focus utility classes
    expect(skipLink.className).toContain('focus:translate-y-0')
  })

  it('shows when focused', () => {
    render(<SkipToContent />)

    const skipLink = screen.getByRole('link', { name: /skip to main content/i })

    // Simulate Tab key press which triggers the focus visibility
    fireEvent.keyDown(document, { key: 'Tab' })
    fireEvent.focus(skipLink)

    // Check that translate-y-0 class appears (controlled by state)
    expect(skipLink.className).toContain('translate-y-0')
  })

  it('hides when not focused', () => {
    render(<SkipToContent />)

    const skipLink = screen.getByRole('link', { name: /skip to main content/i })
    expect(skipLink.className).toContain('-translate-y-full')
  })

  it('scrolls to main content when clicked', () => {
    render(<SkipToContent />)

    const skipLink = screen.getByRole('link', { name: /skip to main content/i })
    const mainContent = document.getElementById('main-content')

    fireEvent.click(skipLink)

    expect(mainContent?.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' })
  })

  it('focuses main content after click', async () => {
    render(<SkipToContent />)

    const skipLink = screen.getByRole('link', { name: /skip to main content/i })
    const mainContent = document.getElementById('main-content')

    fireEvent.click(skipLink)

    // Wait for focus to be set
    await waitFor(() => {
      expect(document.activeElement).toBe(mainContent)
    })
  })

  it('handles missing main content gracefully', () => {
    // Remove main content
    document.body.innerHTML = ''

    render(<SkipToContent />)

    const skipLink = screen.getByRole('link', { name: /skip to main content/i })

    // Should not throw error
    expect(() => {
      fireEvent.click(skipLink)
    }).not.toThrow()
  })

  it('has correct visual appearance classes', () => {
    render(<SkipToContent />)

    const skipLink = screen.getByRole('link', { name: /skip to main content/i })

    // Check for key visual classes
    expect(skipLink.className).toContain('fixed')
    expect(skipLink.className).toContain('bg-white')
    expect(skipLink.className).toContain('dark:bg-gray-900')
    expect(skipLink.className).toContain('px-4')
    expect(skipLink.className).toContain('py-2')
  })

  it('supports keyboard navigation', async () => {
    render(<SkipToContent />)

    const skipLink = screen.getByRole('link', { name: /skip to main content/i })

    // Simulate Tab key
    fireEvent.keyDown(document, { key: 'Tab' })

    // Focus the link
    skipLink.focus()

    // Verify it's focused
    await waitFor(() => {
      expect(document.activeElement).toBe(skipLink)
    })

    // Simulate click
    fireEvent.click(skipLink)

    const mainContent = document.getElementById('main-content')
    await waitFor(() => {
      expect(mainContent?.scrollIntoView).toHaveBeenCalled()
    })
  })
})
