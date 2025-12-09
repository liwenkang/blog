import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import MobileNav from '../MobileNav'

// Mock dependencies
jest.mock('@/data/headerNavLinks', () => [
  { title: 'Home', href: '/' },
  { title: 'Blog', href: '/blog' },
  { title: 'About', href: '/about' },
])

jest.mock('@/lib/focus-management', () => ({
  trapFocus: jest.fn(() => jest.fn()),
  announceToScreenReader: jest.fn(),
}))

jest.mock('../Link', () => {
  return function MockLink({ href, children, ...props }) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    )
  }
})

const { trapFocus, announceToScreenReader } = require('@/lib/focus-management')

describe('MobileNav Component', () => {
  beforeEach(() => {
    // Reset body styles
    document.body.style.overflow = ''
    jest.clearAllMocks()
  })

  afterEach(() => {
    // Cleanup body styles
    document.body.style.overflow = ''
  })

  it('renders mobile navigation button', () => {
    render(<MobileNav />)

    const menuButton = screen.getByRole('button', { name: /menu/i })
    expect(menuButton).toBeInTheDocument()
  })

  it('shows navigation links when menu is opened', () => {
    render(<MobileNav />)

    const menuButton = screen.getByRole('button', { name: /menu/i })
    fireEvent.click(menuButton)

    // Check for navigation links
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Blog' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'About' })).toBeInTheDocument()
  })

  it('hides navigation links when menu is closed', () => {
    render(<MobileNav />)

    // Initially links should not be visible
    expect(screen.queryByRole('link', { name: 'Home' })).not.toBeInTheDocument()
  })

  it('toggles navigation menu on button click', () => {
    render(<MobileNav />)

    const menuButton = screen.getByRole('button', { name: /menu/i })

    // Open menu
    fireEvent.click(menuButton)
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument()

    // Close menu
    fireEvent.click(screen.getByRole('button', { name: /close/i }))
    expect(screen.queryByRole('link', { name: 'Home' })).not.toBeInTheDocument()
  })

  it('sets body overflow to hidden when menu opens', () => {
    render(<MobileNav />)

    const menuButton = screen.getByRole('button', { name: /menu/i })
    fireEvent.click(menuButton)

    expect(document.body.style.overflow).toBe('hidden')
  })

  it('restores body overflow when menu closes', () => {
    render(<MobileNav />)

    const menuButton = screen.getByRole('button', { name: /menu/i })

    // Open menu
    fireEvent.click(menuButton)
    expect(document.body.style.overflow).toBe('hidden')

    // Close menu
    fireEvent.click(screen.getByRole('button', { name: /close/i }))
    expect(document.body.style.overflow).toBe('auto')
  })

  it('announces menu state to screen readers', async () => {
    render(<MobileNav />)

    const menuButton = screen.getByRole('button', { name: /menu/i })

    // Open menu
    fireEvent.click(menuButton)
    await waitFor(() => {
      expect(announceToScreenReader).toHaveBeenCalledWith('Navigation menu opened')
    })

    // Close menu
    fireEvent.click(screen.getByRole('button', { name: /close/i }))
    await waitFor(() => {
      expect(announceToScreenReader).toHaveBeenCalledWith('Navigation menu closed')
    })
  })

  it('calls trapFocus when menu opens', () => {
    const cleanup = jest.fn()
    trapFocus.mockReturnValue(cleanup)

    render(<MobileNav />)

    const menuButton = screen.getByRole('button', { name: /menu/i })
    fireEvent.click(menuButton)

    expect(trapFocus).toHaveBeenCalled()
  })

  it('closes menu on escape key press', () => {
    render(<MobileNav />)

    const menuButton = screen.getByRole('button', { name: /menu/i })

    // Open menu
    fireEvent.click(menuButton)
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument()

    // Press escape key
    fireEvent.keyDown(document, { key: 'Escape' })

    expect(screen.queryByRole('link', { name: 'Home' })).not.toBeInTheDocument()
  })

  it('has proper ARIA attributes for navigation', () => {
    render(<MobileNav />)

    const menuButton = screen.getByRole('button', { name: /menu/i })
    fireEvent.click(menuButton)

    const nav = screen.getByRole('navigation')
    expect(nav).toBeInTheDocument()
  })

  it('has close button when menu is open', () => {
    render(<MobileNav />)

    const menuButton = screen.getByRole('button', { name: /menu/i })
    fireEvent.click(menuButton)

    const closeButton = screen.getByRole('button', { name: /close/i })
    expect(closeButton).toBeInTheDocument()
  })

  it('renders correct number of navigation links', () => {
    render(<MobileNav />)

    const menuButton = screen.getByRole('button', { name: /menu/i })
    fireEvent.click(menuButton)

    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(3) // Home, Blog, About
  })

  it('has proper styling classes for menu button', () => {
    render(<MobileNav />)

    const menuButton = screen.getByRole('button', { name: /menu/i })
    expect(menuButton).toHaveClass('h-6', 'w-6')
  })

  it('has proper styling classes for navigation overlay', () => {
    render(<MobileNav />)

    const menuButton = screen.getByRole('button', { name: /menu/i })
    fireEvent.click(menuButton)

    const overlay = screen.getByRole('navigation').parentElement
    expect(overlay).toHaveClass(
      'fixed',
      'inset-0',
      'z-50',
      'flex',
      'items-center',
      'justify-center',
      'bg-black',
      'bg-opacity-50'
    )
  })

  it('handles mounted state correctly', () => {
    render(<MobileNav />)

    // Menu button should be available immediately
    expect(screen.getByRole('button', { name: /menu/i })).toBeInTheDocument()
  })

  it('prevents body scroll when menu is open', () => {
    render(<MobileNav />)

    const menuButton = screen.getByRole('button', { name: /menu/i })
    fireEvent.click(menuButton)

    // Check if body overflow is set to hidden
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('closes navigation when a link is clicked', () => {
    render(<MobileNav />)

    const menuButton = screen.getByRole('button', { name: /menu/i })
    fireEvent.click(menuButton)

    const homeLink = screen.getByRole('link', { name: 'Home' })
    fireEvent.click(homeLink)

    expect(screen.queryByRole('link', { name: 'Home' })).not.toBeInTheDocument()
  })

  it('has proper transition animations', () => {
    render(<MobileNav />)

    const menuButton = screen.getByRole('button', { name: /menu/i })
    fireEvent.click(menuButton)

    const overlay = screen.getByRole('navigation').parentElement
    expect(overlay).toHaveClass('transition-opacity', 'duration-300')
  })

  it('has proper accessibility for overlay', () => {
    render(<MobileNav />)

    const menuButton = screen.getByRole('button', { name: /menu/i })
    fireEvent.click(menuButton)

    const overlay = screen.getByRole('navigation').parentElement
    expect(overlay).toHaveAttribute('aria-hidden', 'false')
  })
})
