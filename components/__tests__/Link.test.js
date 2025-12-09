import { render, screen } from '@testing-library/react'
import Link from '../Link'

describe('Link Component', () => {
  it('renders internal links with Next.js Link component', () => {
    render(<Link href="/about">About</Link>)

    const link = screen.getByRole('link', { name: 'About' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/about')
  })

  it('renders anchor links with regular a tag', () => {
    render(<Link href="#section1">Go to Section</Link>)

    const link = screen.getByRole('link', { name: 'Go to Section' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '#section1')
    expect(link).not.toHaveAttribute('target')
  })

  it('renders external links with security attributes', () => {
    render(<Link href="https://example.com">External Link</Link>)

    const link = screen.getByRole('link', { name: 'External Link' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', 'https://example.com')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('passes through all props to underlying component', () => {
    render(
      <Link href="/test" className="test-class" data-testid="test-link">
        Test Link
      </Link>
    )

    const link = screen.getByTestId('test-link')
    expect(link).toHaveClass('test-class')
  })

  it('handles empty href gracefully', () => {
    render(<Link>Link without href</Link>)

    const link = screen.getByText('Link without href')
    expect(link).toBeInTheDocument()
    expect(link.tagName.toLowerCase()).toBe('a')
  })

  it('handles undefined href gracefully', () => {
    render(<Link href={undefined}>Link with undefined href</Link>)

    const link = screen.getByText('Link with undefined href')
    expect(link).toBeInTheDocument()
    expect(link.tagName.toLowerCase()).toBe('a')
  })

  it('correctly identifies internal links starting with /', () => {
    render(<Link href="/blog/post">Blog Post</Link>)

    const link = screen.getByRole('link', { name: 'Blog Post' })
    expect(link).toHaveAttribute('href', '/blog/post')
  })

  it('correctly identifies anchor links starting with #', () => {
    render(<Link href="#top">Back to Top</Link>)

    const link = screen.getByRole('link', { name: 'Back to Top' })
    expect(link).toHaveAttribute('href', '#top')
  })

  it('correctly identifies external links with http/https', () => {
    render(<Link href="http://example.com">HTTP Link</Link>)
    render(<Link href="https://secure.com">HTTPS Link</Link>)

    const httpLink = screen.getByRole('link', { name: 'HTTP Link' })
    const httpsLink = screen.getByRole('link', { name: 'HTTPS Link' })

    expect(httpLink).toHaveAttribute('target', '_blank')
    expect(httpLink).toHaveAttribute('rel', 'noopener noreferrer')
    expect(httpsLink).toHaveAttribute('target', '_blank')
    expect(httpsLink).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('handles complex internal routes', () => {
    render(<Link href="/blog/category/[slug]">Dynamic Route</Link>)

    const link = screen.getByRole('link', { name: 'Dynamic Route' })
    expect(link).toHaveAttribute('href', '/blog/category/[slug]')
  })

  it('handles relative internal paths', () => {
    render(<Link href="/relative/path">Relative Path</Link>)

    const link = screen.getByRole('link', { name: 'Relative Path' })
    expect(link).toHaveAttribute('href', '/relative/path')
  })

  it('preserves custom attributes', () => {
    render(
      <Link href="/custom" aria-label="Custom label" title="Custom title" data-custom="test">
        Custom Link
      </Link>
    )

    const link = screen.getByRole('link', { name: 'Custom label' })
    expect(link).toHaveAttribute('title', 'Custom title')
    expect(link).toHaveAttribute('data-custom', 'test')
  })

  it('handles missing href with default attributes', () => {
    render(<Link>Link with missing href</Link>)

    const link = screen.getByText('Link with missing href')
    expect(link).toBeInTheDocument()
    // When href is missing, Link component defaults to external link behavior
  })
})
