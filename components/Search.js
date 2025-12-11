import { useState, useEffect, useRef, useCallback } from 'react'
import FlexSearch from 'flexsearch'
import { announceToScreenReader } from '@/lib/focus-management'

// 搜索结果项组件
const SearchResultItem = ({ item, onSelect, onKeyDown, isActive }) => {
  return (
    <div
      className={`block px-4 py-3 cursor-pointer transition-colors duration-150 ${
        isActive
          ? 'bg-primary-50 dark:bg-primary-900/20 border-l-4 border-primary-500'
          : 'hover:bg-gray-50 dark:hover:bg-gray-800 border-l-4 border-transparent'
      }`}
      onClick={() => onSelect(item)}
      onKeyDown={onKeyDown}
      role="option"
      aria-selected={isActive}
    >
      <div className="flex flex-col space-y-1">
        <div className="font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
          {item.title}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{item.summary}</div>
        <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-500">
          <span>{item.date}</span>
          <span>•</span>
          <span>{item.readingTime}</span>
          {item.tags && item.tags.length > 0 && (
            <>
              <span>•</span>
              <div className="flex gap-1">
                {item.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded"
                  >
                    {tag}
                  </span>
                ))}
                {item.tags.length > 3 && (
                  <span className="text-gray-500 dark:text-gray-400">+{item.tags.length - 3}</span>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const Search = ({ onClose }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [searchIndex, setSearchIndex] = useState(null)
  const [searchData, setSearchData] = useState([])

  const searchInputRef = useRef(null)
  const searchContainerRef = useRef(null)
  const resultsRef = useRef(null)

  // 加载搜索索引和数据
  useEffect(() => {
    const loadSearchData = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/search.json')
        const data = await response.json()

        // 创建FlexSearch索引
        const index = new FlexSearch.Index({
          tokenize: 'full',
          resolution: 9,
          depth: 2,
          charset: 'latin:simplified',
          optimize: true,
          cache: true,
        })

        // 添加文档到索引
        data.forEach((item, i) => {
          index.add(i, item.searchText)
        })

        setSearchIndex(index)
        setSearchData(data)
        setIsLoading(false)
      } catch (error) {
        // 动态导入 logger 避免增加初始包大小
        import('@/lib/core/logger').then(({ logger }) => {
          logger.error('加载搜索数据失败', error)
        })
        setIsLoading(false)
      }
    }

    loadSearchData()
  }, [])

  // 执行搜索
  const performSearch = useCallback(
    (query) => {
      if (!searchIndex || !query.trim()) {
        setSearchResults([])
        setSelectedIndex(-1)
        return
      }

      try {
        const results = searchIndex.search(query)
        const matchedItems = results.map((index) => searchData[index]).filter(Boolean)

        setSearchResults(matchedItems)
        setSelectedIndex(-1)

        // 向屏幕阅读器宣布搜索结果
        if (matchedItems.length > 0) {
          announceToScreenReader(`找到 ${matchedItems.length} 个搜索结果`)
        } else {
          announceToScreenReader('未找到相关内容')
        }
      } catch (error) {
        import('@/lib/core/logger').then(({ logger }) => {
          logger.error('搜索执行失败', error)
        })
        setSearchResults([])
      }
    },
    [searchIndex, searchData]
  )

  // 防抖搜索
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchQuery)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, performSearch])

  // 自动聚焦输入框
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [])

  // 键盘导航
  const handleKeyDown = (e) => {
    const resultsCount = searchResults.length

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        if (resultsCount > 0) {
          const newIndex = selectedIndex < resultsCount - 1 ? selectedIndex + 1 : 0
          setSelectedIndex(newIndex)
        }
        break

      case 'ArrowUp':
        e.preventDefault()
        if (resultsCount > 0) {
          const newIndex = selectedIndex > 0 ? selectedIndex - 1 : resultsCount - 1
          setSelectedIndex(newIndex)
        }
        break

      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && searchResults[selectedIndex]) {
          handleResultSelect(searchResults[selectedIndex])
        }
        break

      case 'Escape':
        e.preventDefault()
        onClose()
        break
    }
  }

  // 选择搜索结果
  const handleResultSelect = (item) => {
    onClose()
    // 使用Next.js路由导航到文章页面
    window.location.href = item.url
  }

  // 点击外部关闭搜索
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onClose])

  // 阻止body滚动
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/50 backdrop-blur-sm">
      <div
        ref={searchContainerRef}
        className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label="搜索"
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="搜索文章、标签..."
              className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              aria-label="搜索输入框"
              autoComplete="off"
            />
            <button
              onClick={onClose}
              className="flex-shrink-0 p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="关闭搜索"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto" ref={resultsRef}>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
          ) : searchQuery && searchResults.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
              <div className="mb-2">
                <svg
                  className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-lg font-medium mb-1">未找到相关内容</p>
              <p className="text-sm">尝试使用不同的关键词进行搜索</p>
            </div>
          ) : searchResults.length > 0 ? (
            <div role="listbox" aria-label="搜索结果">
              {searchResults.map((item, index) => (
                <SearchResultItem
                  key={item.id}
                  item={item}
                  onSelect={handleResultSelect}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleResultSelect(item)
                    }
                  }}
                  isActive={index === selectedIndex}
                />
              ))}
            </div>
          ) : searchQuery ? (
            <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
              <p>输入关键词开始搜索...</p>
            </div>
          ) : null}
        </div>

        {searchResults.length > 0 && (
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>找到 {searchResults.length} 个结果</span>
              <div className="flex items-center space-x-2 text-xs">
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">
                  ↑↓
                </kbd>
                <span>导航</span>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">
                  Enter
                </kbd>
                <span>选择</span>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">
                  Esc
                </kbd>
                <span>关闭</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Search
