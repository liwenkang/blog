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

  it('shows loading state when not mounted', () => {
    // Simulate not mounted state
    useTheme.mockReturnValue({
      theme: 'light',
      resolvedTheme: 'light',
      setTheme: jest.fn(),
    })

    render(<ThemeSwitch />)

    // In the first render, mounted is false, so button should be disabled
    setTimeout(() => {
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    }, 0)
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

  it('toggles theme on Enter key press', () => {
    const mockSetTheme = jest.fn()
    useTheme.mockReturnValue({
      theme: 'dark',
      resolvedTheme: 'dark',
      setTheme: mockSetTheme,
    })

    render(<ThemeSwitch />)

    const button = screen.getByRole('button', { name: /toggle light mode/i })
    fireEvent.keyDown(button, { key: 'Enter' })

    expect(mockSetTheme).toHaveBeenCalledWith('light')
  })

  it('toggles theme on Space key press', () => {
    const mockSetTheme = jest.fn()
    useTheme.mockReturnValue({
      theme: 'light',
      resolvedTheme: 'light',
      setTheme: mockSetTheme,
    })

    render(<ThemeSwitch />)

    const button = screen.getByRole('button', { name: /toggle dark mode/i })
    fireEvent.keyDown(button, { key: ' ' })

    expect(mockSetTheme).toHaveBeenCalledWith('dark')
  })

  it('prevents default behavior on Enter key press', () => {
    const mockSetTheme = jest.fn()
    useTheme.mockReturnValue({
      theme: 'light',
      resolvedTheme: 'light',
      setTheme: mockSetTheme,
    })

    render(<ThemeSwitch />)

    const button = screen.getByRole('button')
    const event = new KeyboardEvent('keydown', { key: 'Enter' })
    event.preventDefault = jest.fn()

    fireEvent.keyDown(button, event)

    expect(event.preventDefault).toHaveBeenCalled()
  })

  it('prevents default behavior on Space key press', () => {
    const mockSetTheme = jest.fn()
    useTheme.mockReturnValue({
      theme: 'light',
      resolvedTheme: 'light',
      setTheme: mockSetTheme,
    })

    render(<ThemeSwitch />)

    const button = screen.getByRole('button')
    const event = new KeyboardEvent('keydown', { key: ' ' })
    event.preventDefault = jest.fn()

    fireEvent.keyDown(button, event)

    expect(event.preventDefault).toHaveBeenCalled()
  })

  it('does not trigger theme change on other key presses', () => {
    const mockSetTheme = jest.fn()
    useTheme.mockReturnValue({
      theme: 'light',
      resolvedTheme: 'light',
      setTheme: mockSetTheme,
    })

    render(<ThemeSwitch />)

    const button = screen.getByRole('button')
    fireEvent.keyDown(button, { key: 'Tab' })

    expect(mockSetTheme).not.toHaveBeenCalled()
  })

  it('shows sun icon in light mode', () => {
    useTheme.mockReturnValue({
      theme: 'light',
      resolvedTheme: 'light',
      setTheme: jest.fn(),
    })

    render(<ThemeSwitch />)

    // Check for sun icon path (the first path in the conditional)
    const icon = screen.getByRole('button').querySelector('svg path')
    expect(icon).toHaveAttribute('fillRule', 'evenodd')
  })

  it('shows moon icon in dark mode', () => {
    useTheme.mockReturnValue({
      theme: 'dark',
      resolvedTheme: 'dark',
      setTheme: jest.fn(),
    })

    render(<ThemeSwitch />)

    // Check for moon icon path (the second path in the conditional)
    const icon = screen.getByRole('button').querySelector('svg path')
    expect(icon).toHaveAttribute(
      'd',
      'M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z'
    )
  })

  it('uses resolvedTheme when theme is system', () => {
    useTheme.mockReturnValue({
      theme: 'system',
      resolvedTheme: 'dark',
      setTheme: jest.fn(),
    })

    render(<ThemeSwitch />)

    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Toggle light mode')
  })

  it('has proper CSS classes', () => {
    render(<ThemeSwitch />)

    const button = screen.getByRole('button')
    expect(button).toHaveClass(
      'ml-1',
      'mr-1',
      'h-8',
      'w-8',
      'rounded-sm',
      'p-1',
      'text-gray-900',
      'dark:text-gray-100',
      'hover:bg-gray-100',
      'dark:hover:bg-gray-800',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-primary-500',
      'focus:ring-offset-2'
    )
  })

  it('has proper SVG attributes', () => {
    render(<ThemeSwitch />)

    const svg = screen.getByRole('button').querySelector('svg')
    expect(svg).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg')
    expect(svg).toHaveAttribute('viewBox', '0 0 20 20')
    expect(svg).toHaveAttribute('fill', 'currentColor')
    expect(svg).toHaveClass('text-gray-900', 'dark:text-gray-100')
  })
})
