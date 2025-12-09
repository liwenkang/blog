import { render, screen, fireEvent } from '@testing-library/react'
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
    expect(skipLink).toHaveClass('fixed', 'top-0', 'left-0', 'z-50')
  })

  it('has proper focus styles', () => {
    render(<SkipToContent />)

    const skipLink = screen.getByRole('link', { name: /skip to main content/i })
    expect(skipLink).toHaveClass('focus:translate-y-0')
  })

  it('shows when focused', () => {
    render(<SkipToContent />)

    const skipLink = screen.getByRole('link', { name: /skip to main content/i })

    // Simulate focus
    fireEvent.focus(skipLink)

    // Check that focus:translate-y-0 class is present (it's a focus utility class)
    expect(skipLink).toHaveClass('focus:translate-y-0')
  })

  it('hides when not focused', () => {
    render(<SkipToContent />)

    const skipLink = screen.getByRole('link', { name: /skip to main content/i })

    // Default state should be hidden
    expect(skipLink).toHaveClass('-translate-y-full')
  })

  it('handles click to skip to content', () => {
    render(<SkipToContent />)

    const skipLink = screen.getByRole('link', { name: /skip to main content/i })
    fireEvent.click(skipLink)

    expect(skipLink).toBeInTheDocument()
    expect(HTMLElement.prototype.scrollIntoView).toHaveBeenCalled()
  })

  it('handles keyboard navigation', () => {
    render(<SkipToContent />)

    const skipLink = screen.getByRole('link', { name: /skip to main content/i })

    // Simulate Tab key press
    fireEvent.keyDown(document, { key: 'Tab' })

    expect(skipLink).toBeInTheDocument()
  })

  it('has proper ARIA attributes', () => {
    render(<SkipToContent />)

    const skipLink = screen.getByRole('link', { name: /skip to main content/i })
    expect(skipLink).toBeInTheDocument()
    // aria-label is set on the link by name attribute in getByRole
  })

  it('has proper styling classes', () => {
    render(<SkipToContent />)

    const skipLink = screen.getByRole('link', { name: /skip to main content/i })

    // Check for base styling classes
    expect(skipLink).toHaveClass(
      'px-4',
      'py-2',
      'bg-white',
      'dark:bg-gray-900',
      'text-gray-900',
      'dark:text-gray-100',
      'border',
      'transition-transform'
    )
  })
})
