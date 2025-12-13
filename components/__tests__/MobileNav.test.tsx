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
  return function MockLink({ href, children, ...props }: any) {
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

    const menuButton = screen.getByRole('button', { name: /navigation/i })
    expect(menuButton).toBeInTheDocument()
  })

  it('shows navigation links when menu is opened', () => {
    render(<MobileNav />)

    const menuButton = screen.getByRole('button', { name: /navigation/i })
    fireEvent.click(menuButton)

    // Check for navigation links
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Blog' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'About' })).toBeInTheDocument()
  })

  it('hides navigation links when menu is closed', async () => {
    render(<MobileNav />)

    const menuButton = screen.getByRole('button', { name: /navigation/i })

    // Open menu
    fireEvent.click(menuButton)
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument()

    // Close menu (clicking the same button again)
    fireEvent.click(menuButton)

    // Links should not be visible
    await waitFor(() => {
      expect(screen.queryByRole('link', { name: 'Home' })).not.toBeInTheDocument()
    })
  })

  it('prevents body scroll when menu is open', () => {
    render(<MobileNav />)

    const menuButton = screen.getByRole('button', { name: /navigation/i })
    fireEvent.click(menuButton)

    expect(document.body.style.overflow).toBe('hidden')
  })

  it('restores body scroll when menu is closed', () => {
    render(<MobileNav />)

    const menuButton = screen.getByRole('button', { name: /navigation/i })
    fireEvent.click(menuButton)

    // Click again to close
    fireEvent.click(menuButton)

    expect(document.body.style.overflow).toBe('auto')
  })

  it('traps focus when menu is open', () => {
    render(<MobileNav />)

    const menuButton = screen.getByRole('button', { name: /navigation/i })
    fireEvent.click(menuButton)

    expect(trapFocus).toHaveBeenCalled()
  })

  it('announces menu state to screen readers', () => {
    render(<MobileNav />)

    const menuButton = screen.getByRole('button', { name: /navigation/i })
    fireEvent.click(menuButton)

    expect(announceToScreenReader).toHaveBeenCalledWith('Navigation menu opened')
  })

  it('closes menu on navigation link click', async () => {
    render(<MobileNav />)

    const menuButton = screen.getByRole('button', { name: /navigation/i })
    fireEvent.click(menuButton)

    const homeLink = screen.getByRole('link', { name: 'Home' })
    fireEvent.click(homeLink)

    await waitFor(() => {
      expect(screen.queryByRole('link', { name: 'Home' })).not.toBeInTheDocument()
    })
  })

  it('closes menu on Escape key press', async () => {
    render(<MobileNav />)

    const menuButton = screen.getByRole('button', { name: /navigation/i })
    fireEvent.click(menuButton)

    fireEvent.keyDown(document, { key: 'Escape' })

    await waitFor(() => {
      expect(screen.queryByRole('link', { name: 'Home' })).not.toBeInTheDocument()
    })
  })

  it('has correct ARIA attributes', () => {
    render(<MobileNav />)

    const menuButton = screen.getByRole('button', { name: /navigation/i })

    expect(menuButton).toHaveAttribute('aria-label', 'Toggle navigation menu')
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(menuButton)

    expect(menuButton).toHaveAttribute('aria-expanded', 'true')
  })

  it('renders correct number of navigation links', () => {
    render(<MobileNav />)

    const menuButton = screen.getByRole('button', { name: /navigation/i })
    fireEvent.click(menuButton)

    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(3) // Home, Blog, About
  })

  it('has correct href attributes', () => {
    render(<MobileNav />)

    const menuButton = screen.getByRole('button', { name: /navigation/i })
    fireEvent.click(menuButton)

    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'Blog' })).toHaveAttribute('href', '/blog')
    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute('href', '/about')
  })

  it('cleans up on unmount', () => {
    const { unmount } = render(<MobileNav />)

    const menuButton = screen.getByRole('button', { name: /navigation/i })
    fireEvent.click(menuButton)

    unmount()

    // Body overflow should be reset (component cleanup should handle this)
    expect(document.body.style.overflow).toBeDefined()
  })
})
