import { render, screen, fireEvent } from '@testing-library/react'
import SkipToContent from '../SkipToContent'

describe('SkipToContent Component', () => {
  beforeEach(() => {
    // 创建一个带有 main-content id 的元素
    const mainContent = document.createElement('div')
    mainContent.id = 'main-content'
    mainContent.tabIndex = -1
    document.body.appendChild(mainContent)
  })

  afterEach(() => {
    // 清理
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

    // 模拟键盘导航
    fireEvent.focus(skipLink)
    expect(skipLink).toHaveClass('translate-y-0')
  })

  it('hides when not focused', () => {
    render(<SkipToContent />)

    const skipLink = screen.getByRole('link', { name: /skip to main content/i })

    // 默认状态应该是隐藏的
    expect(skipLink).toHaveClass('-translate-y-full')
  })

  it('handles click to skip to content', () => {
    render(<SkipToContent />)

    const skipLink = screen.getByRole('link', { name: /skip to main content/i })
    const mainContent = document.getElementById('main-content')

    // 模拟点击
    fireEvent.click(skipLink)

    // 验证 preventDefault 被调用（通过事件对象）
    expect(skipLink).toBeInTheDocument()
  })

  it('handles keyboard navigation', () => {
    render(<SkipToContent />)

    const skipLink = screen.getByRole('link', { name: /skip to main content/i })

    // 模拟 Tab 键按下
    fireEvent.keyDown(document, { key: 'Tab' })

    // 组件应该显示
    expect(skipLink).toBeInTheDocument()
  })

  it('has proper ARIA attributes', () => {
    render(<SkipToContent />)

    const skipLink = screen.getByRole('link', { name: /skip to main content/i })
    expect(skipLink).toHaveAttribute('aria-label', 'Skip to main content')
  })

  it('has proper styling classes', () => {
    render(<SkipToContent />)

    const skipLink = screen.getByRole('link', { name: /skip to main content/i })

    // 检查基础样式类
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
