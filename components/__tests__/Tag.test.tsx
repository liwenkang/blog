import React from 'react'
import { render, screen } from '../../__tests__/utils/testUtils'
import Tag from '../Tag'

// Mock Next.js Link
jest.mock('next/link', () => {
  return function MockLink({ href, children, ...props }: any) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    )
  }
})

// Mock kebabCase utility
jest.mock('@/lib/utils/kebabCase', () => {
  const mockKebabCase = jest.fn((text: string) => text.toLowerCase().replaceAll(/\s+/g, '-'))
  return {
    __esModule: true,
    default: mockKebabCase,
  }
})

describe('Tag component', () => {
  it('renders tag text correctly', () => {
    render(<Tag text="React" />)

    const tagLink = screen.getByRole('link')
    expect(tagLink).toBeInTheDocument()
    expect(tagLink).toHaveTextContent('React')
  })

  it('converts spaces to dashes in display text', () => {
    render(<Tag text="JavaScript Tutorial" />)

    const tagLink = screen.getByRole('link')
    expect(tagLink).toHaveTextContent('JavaScript-Tutorial')
  })

  it('uses kebabCase for href', () => {
    const kebabCaseMock = jest.mocked(require('@/lib/utils/kebabCase').default)
    render(<Tag text="JavaScript Tutorial" />)

    expect(kebabCaseMock).toHaveBeenCalledWith('JavaScript Tutorial')
    expect(screen.getByRole('link')).toHaveAttribute('href', '/tags/javascript-tutorial')
  })

  it('has correct CSS classes', () => {
    render(<Tag text="React" />)

    const tagLink = screen.getByRole('link')
    expect(tagLink).toHaveClass(
      'mr-3',
      'text-sm',
      'font-medium',
      'uppercase',
      'text-primary-500',
      'hover:text-primary-600',
      'dark:hover:text-primary-400'
    )
  })

  it('handles single word tags', () => {
    render(<Tag text="CSS" />)

    const tagLink = screen.getByRole('link')
    expect(tagLink).toHaveTextContent('CSS')
    expect(tagLink).toHaveAttribute('href', '/tags/css')
  })

  it('handles tags with multiple spaces', () => {
    render(<Tag text="React   Hooks" />)

    const tagLink = screen.getByRole('link')
    expect(tagLink).toHaveTextContent('React---Hooks')
  })

  it('handles empty tag text', () => {
    render(<Tag text="" />)

    const tagLink = screen.getByRole('link')
    expect(tagLink).toBeInTheDocument()
    expect(tagLink).toHaveTextContent('')
  })

  it('handles special characters in tag text', () => {
    render(<Tag text="C++ Programming" />)

    const tagLink = screen.getByRole('link')
    expect(tagLink).toHaveTextContent('C++-Programming')
  })

  it('creates correct href path', () => {
    render(<Tag text="TypeScript" />)

    const tagLink = screen.getByRole('link')
    expect(tagLink).toHaveAttribute('href', '/tags/typescript')
  })

  it('preserves uppercase in display text', () => {
    render(<Tag text="API Design" />)

    const tagLink = screen.getByRole('link')
    // The component uses uppercase class, but text content should be "API-Design"
    expect(tagLink).toHaveTextContent('API-Design')
  })
})
