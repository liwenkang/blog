import React from 'react'
import { render, screen } from '../../__tests__/utils/testUtils'
import Card from '../Card'

// Mock the child components
jest.mock('../Image', () => {
  return function MockImage({ src, alt, className }: any) {
    return <img data-testid="mock-image" src={src} alt={alt} className={className} />
  }
})

jest.mock('../Link', () => {
  return function MockLink({ href, children, ...props }: any) {
    return (
      <a href={href} data-testid="mock-link" {...props}>
        {children}
      </a>
    )
  }
})

describe('Card component', () => {
  const defaultProps = {
    title: 'Test Card',
    description: 'This is a test card description',
  }

  it('renders card with title and description', () => {
    render(<Card {...defaultProps} />)

    expect(screen.getByText('Test Card')).toBeInTheDocument()
    expect(screen.getByText('This is a test card description')).toBeInTheDocument()
  })

  it('renders card with image when imgSrc is provided', () => {
    render(<Card {...defaultProps} imgSrc="/test-image.jpg" />)

    expect(screen.getByTestId('mock-image')).toBeInTheDocument()
    expect(screen.getByTestId('mock-image')).toHaveAttribute('src', '/test-image.jpg')
    expect(screen.getByTestId('mock-image')).toHaveAttribute('alt', 'Test Card')
  })

  it('renders card without image when imgSrc is not provided', () => {
    render(<Card {...defaultProps} />)

    expect(screen.queryByTestId('mock-image')).not.toBeInTheDocument()
  })

  it('renders title as link when href is provided', () => {
    render(<Card {...defaultProps} href="/test-url" />)

    // Find the link within the h2 element (title link)
    const titleHeading = screen.getByRole('heading', { level: 2 })
    const titleLink = titleHeading.querySelector('a')
    expect(titleLink).toBeInTheDocument()
    expect(titleLink).toHaveAttribute('href', '/test-url')
    expect(titleLink).toHaveAttribute('aria-label', 'Link to Test Card')
  })

  it('renders title as plain text when href is not provided', () => {
    render(<Card {...defaultProps} />)

    const titleElement = screen.getByText('Test Card')
    expect(titleElement.tagName).not.toBe('A')
  })

  it('renders "Learn more" link when href is provided', () => {
    render(<Card {...defaultProps} href="/test-url" />)

    // Use a more flexible text matcher for "Learn more →"
    const learnMoreLink = screen.getByText((content) => {
      return content.includes('Learn more')
    })
    expect(learnMoreLink).toBeInTheDocument()
    expect(learnMoreLink.closest('a')).toHaveAttribute('href', '/test-url')
  })

  it('does not render "Learn more" link when href is not provided', () => {
    render(<Card {...defaultProps} />)

    const learnMoreText = screen.queryByText((content) => {
      return content.includes('Learn more')
    })
    expect(learnMoreText).not.toBeInTheDocument()
  })

  it('applies correct CSS classes to card', () => {
    const { container } = render(<Card {...defaultProps} />)

    // Get the inner card div (second div)
    const cardElement = container.querySelector('div > div:nth-child(1)')
    expect(cardElement?.className).toContain('overflow-hidden')
    expect(cardElement?.className).toContain('rounded-md')
    expect(cardElement?.className).toContain('border-2')
  })

  it('renders with all props provided', () => {
    render(
      <Card
        title="Full Card"
        description="Complete description"
        imgSrc="/image.jpg"
        href="/full-card"
      />
    )

    expect(screen.getByText('Full Card')).toBeInTheDocument()
    expect(screen.getByText('Complete description')).toBeInTheDocument()
    expect(screen.getByTestId('mock-image')).toBeInTheDocument()
  })

  it('handles long title correctly', () => {
    const longTitle = 'This is a very long card title that should still render properly'
    render(<Card {...defaultProps} title={longTitle} />)

    expect(screen.getByText(longTitle)).toBeInTheDocument()
  })

  it('handles long description correctly', () => {
    const longDescription =
      'This is a very long description that spans multiple lines and should render correctly in the card component'
    render(<Card {...defaultProps} description={longDescription} />)

    expect(screen.getByText(longDescription)).toBeInTheDocument()
  })
})
