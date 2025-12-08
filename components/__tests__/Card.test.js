import React from 'react'
import { render, screen } from '../../__tests__/utils/testUtils'
import Card from '../Card'

// Mock the child components
jest.mock('../Image', () => {
  return function MockImage({ src, alt, className, ...props }) {
    return <img data-testid="mock-image" src={src} alt={alt} className={className} {...props} />
  }
})

jest.mock('../Link', () => {
  return function MockLink({ href, children, ...props }) {
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
    const learnMoreLink = screen.getByText((content, element) => {
      return content.includes('Learn more')
    })
    expect(learnMoreLink).toBeInTheDocument()
    expect(learnMoreLink.closest('a')).toHaveAttribute('href', '/test-url')
  })

  it('does not render "Learn more" link when href is not provided', () => {
    render(<Card {...defaultProps} />)

    expect(screen.queryByRole('link', { name: /learn more/i })).not.toBeInTheDocument()
  })

  it('wraps image in link when both imgSrc and href are provided', () => {
    render(<Card {...defaultProps} imgSrc="/test-image.jpg" href="/test-url" />)

    const image = screen.getByTestId('mock-image')
    expect(image.closest('a')).toHaveAttribute('href', '/test-url')
  })

  it('renders image without link wrapper when imgSrc is provided but href is not', () => {
    render(<Card {...defaultProps} imgSrc="/test-image.jpg" />)

    const image = screen.getByTestId('mock-image')
    expect(image.closest('a')).not.toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(<Card {...defaultProps} imgSrc="/test-image.jpg" href="/test-url" />)

    // Check aria-label attributes - there are multiple links with same label, use getAllByRole
    const links = screen.getAllByRole('link', { name: 'Link to Test Card' })
    expect(links).toHaveLength(3) // Image link, title link, and "Learn more" link
    links.forEach((link) => {
      expect(link).toHaveAttribute('aria-label', 'Link to Test Card')
    })
  })
})
