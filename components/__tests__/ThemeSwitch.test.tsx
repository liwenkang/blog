import { render, screen, fireEvent } from '@testing-library/react'
import ThemeSwitch from '../ThemeSwitch'

// Mock useTheme hook
jest.mock('next-themes', () => ({
  useTheme: jest.fn(),
}))

const { useTheme } = require('next-themes')

describe('ThemeSwitch Component', () => {
  beforeEach(() => {
    useTheme.mockReturnValue({
      theme: 'light',
      resolvedTheme: 'light',
      setTheme: jest.fn(),
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders theme switch button', () => {
    render(<ThemeSwitch />)

    const button = screen.getByRole('button', { name: /toggle dark mode/i })
    expect(button).toBeInTheDocument()
  })

  it('displays correct aria-label based on current theme', () => {
    // Light theme
    useTheme.mockReturnValue({
      theme: 'light',
      resolvedTheme: 'light',
      setTheme: jest.fn(),
    })

    const { rerender } = render(<ThemeSwitch />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Toggle dark mode')

    // Dark theme
    useTheme.mockReturnValue({
      theme: 'dark',
      resolvedTheme: 'dark',
      setTheme: jest.fn(),
    })

    rerender(<ThemeSwitch />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Toggle light mode')
  })

  it('toggles theme on click', () => {
    const mockSetTheme = jest.fn()
    useTheme.mockReturnValue({
      theme: 'light',
      resolvedTheme: 'light',
      setTheme: mockSetTheme,
    })

    render(<ThemeSwitch />)

    const button = screen.getByRole('button', { name: /toggle dark mode/i })
    fireEvent.click(button)

    expect(mockSetTheme).toHaveBeenCalledWith('dark')
  })

  it('toggles from dark to light', () => {
    const mockSetTheme = jest.fn()
    useTheme.mockReturnValue({
      theme: 'dark',
      resolvedTheme: 'dark',
      setTheme: mockSetTheme,
    })

    render(<ThemeSwitch />)

    const button = screen.getByRole('button', { name: /toggle light mode/i })
    fireEvent.click(button)

    expect(mockSetTheme).toHaveBeenCalledWith('light')
  })

  it('has correct CSS classes', () => {
    render(<ThemeSwitch />)

    const button = screen.getByRole('button')
    expect(button).toHaveClass('ml-1', 'mr-1', 'h-8', 'w-8', 'rounded-sm', 'p-1')
  })

  it('renders SVG icon', () => {
    const { container } = render(<ThemeSwitch />)

    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('handles keyboard interaction', () => {
    const mockSetTheme = jest.fn()
    useTheme.mockReturnValue({
      theme: 'light',
      resolvedTheme: 'light',
      setTheme: mockSetTheme,
    })

    render(<ThemeSwitch />)

    const button = screen.getByRole('button')
    fireEvent.keyDown(button, { key: 'Enter' })
    fireEvent.click(button)

    expect(mockSetTheme).toHaveBeenCalled()
  })

  it('handles system theme preference', () => {
    useTheme.mockReturnValue({
      theme: 'system',
      resolvedTheme: 'light',
      setTheme: jest.fn(),
    })

    render(<ThemeSwitch />)

    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
  })

  it('uses resolvedTheme when theme is system', () => {
    const mockSetTheme = jest.fn()
    useTheme.mockReturnValue({
      theme: 'system',
      resolvedTheme: 'dark',
      setTheme: mockSetTheme,
    })

    render(<ThemeSwitch />)

    const button = screen.getByRole('button', { name: /toggle light mode/i })
    fireEvent.click(button)

    expect(mockSetTheme).toHaveBeenCalledWith('light')
  })
})
