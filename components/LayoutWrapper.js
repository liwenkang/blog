import { useState, useEffect } from 'react'
import siteMetadata from '@/data/siteMetadata'
import headerNavLinks from '@/data/headerNavLinks'
import Logo from '@/data/logo.svg'
import Link from './Link'
import SectionContainer from './SectionContainer'
import Footer from './Footer'
import MobileNav from './MobileNav'
import ThemeSwitch from './ThemeSwitch'
import Search from './Search'
import { announceToScreenReader } from '@/lib/focus-management'

const LayoutWrapper = ({ children }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  // 全局键盘快捷键监听 (Ctrl/Cmd + K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // 检查是否按下 Ctrl/Cmd + K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setIsSearchOpen(true)
        announceToScreenReader('搜索已打开，输入关键词进行搜索')
      }
      // ESC 键关闭搜索
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false)
        announceToScreenReader('搜索已关闭')
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isSearchOpen])

  return (
    <SectionContainer>
      <div className="flex h-screen flex-col justify-between">
        <header className="flex items-center justify-between py-10" role="banner">
          <div>
            <Link
              href="/"
              aria-label={`${siteMetadata.headerTitle} - Go to homepage`}
              className="flex items-center space-x-3 hover:opacity-80 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
            >
              <div className="flex items-center justify-between">
                <div className="mr-3" aria-hidden="true">
                  <Logo />
                </div>
                {typeof siteMetadata.headerTitle === 'string' ? (
                  <div className="hidden h-6 text-2xl font-semibold sm:block">
                    {siteMetadata.headerTitle}
                  </div>
                ) : (
                  siteMetadata.headerTitle
                )}
              </div>
            </Link>
          </div>
          <nav className="flex items-center text-base leading-5" aria-label="Main navigation">
            <div className="hidden sm:block">
              <ol className="flex items-center space-x-8" role="list">
                {headerNavLinks.map((link, index) => (
                  <li key={link.title} role="listitem">
                    <Link
                      href={link.href}
                      className="nav-link"
                      aria-current={link.href === '/' ? 'page' : undefined}
                    >
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ol>
            </div>

            {/* 搜索按钮 */}
            <button
              type="button"
              className="ml-4 mr-2 p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-md transition-colors duration-200"
              onClick={() => {
                setIsSearchOpen(true)
                announceToScreenReader('搜索已打开，输入关键词进行搜索')
              }}
              aria-label="打开搜索 (Ctrl+K)"
              title="搜索 (Ctrl+K)"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>

            <ThemeSwitch />
            <MobileNav />
          </nav>
        </header>
        <main id="main-content" className="mb-auto" tabIndex="-1" role="main">
          {children}
        </main>
        <Footer />
      </div>

      {/* 搜索模态框 */}
      {isSearchOpen && <Search onClose={() => setIsSearchOpen(false)} />}
    </SectionContainer>
  )
}

export default LayoutWrapper
