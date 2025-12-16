import { render, screen } from '../../__tests__/utils/testUtils'
import PageTitle from '../PageTitle'

describe('PageTitle component', () => {
  it('renders children as h1 element', () => {
    render(<PageTitle>Test Page Title</PageTitle>)

    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toBeInTheDocument()
    expect(heading).toHaveTextContent('Test Page Title')
  })

  it('has correct CSS classes', () => {
    render(<PageTitle>Test Title</PageTitle>)

    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveClass(
      'text-3xl',
      'font-extrabold',
      'leading-9',
      'tracking-tight',
      'text-gray-900',
      'dark:text-gray-100',
      'sm:text-4xl',
      'sm:leading-10',
      'md:text-5xl',
      'md:leading-14'
    )
  })

  it('renders complex children content', () => {
    render(
      <PageTitle>
        <span>Complex</span> <strong>Title</strong>
      </PageTitle>
    )

    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toBeInTheDocument()
    expect(screen.getByText('Complex')).toBeInTheDocument()
    expect(screen.getByText('Title')).toBeInTheDocument()
  })

  it('handles empty children', () => {
    render(<PageTitle>{undefined}</PageTitle>)

    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toBeInTheDocument()
    expect(heading).toBeEmptyDOMElement()
  })

  it('handles null children', () => {
    render(<PageTitle>{null}</PageTitle>)

    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toBeInTheDocument()
    expect(heading).toBeEmptyDOMElement()
  })

  it('renders string children', () => {
    const title = 'Simple String Title'
    render(<PageTitle>{title}</PageTitle>)

    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent(title)
  })

  it('renders number children', () => {
    render(<PageTitle>{2024}</PageTitle>)

    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent('2024')
  })
})
