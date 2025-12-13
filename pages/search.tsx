import { useState } from 'react'
import siteMetadata from '@/data/siteMetadata'
import { PageSEO } from '@/components/SEO'
import Search from '@/components/Search'
import RegionErrorBoundary from '@/components/RegionErrorBoundary'

export default function SearchPage() {
  const [isSearchOpen, setIsSearchOpen] = useState(true)

  return (
    <>
      <PageSEO
        title={`搜索 - ${siteMetadata.author}`}
        description={`搜索 ${siteMetadata.author} 的博客文章`}
      />
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-2xl text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">搜索博客</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            搜索 {String('totalPages' in siteMetadata ? siteMetadata.totalPages : '37')} 篇技术文章
          </p>
          <div className="text-sm text-gray-500 dark:text-gray-500 space-y-1">
            <p>💡 提示：您也可以按 Ctrl+K（Mac：Cmd+K）在任意页面快速打开搜索</p>
            <p>📝 支持搜索标题、内容和标签</p>
            <p>🔍 搜索结果实时显示，无需点击搜索按钮</p>
          </div>
        </div>

        {/* 搜索演示按钮 */}
        {!isSearchOpen && (
          <button
            type="button"
            className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            onClick={() => setIsSearchOpen(true)}
          >
            打开搜索
          </button>
        )}

        {/* 搜索模态框 */}
        {isSearchOpen && (
          <RegionErrorBoundary label="搜索">
            <Search onClose={() => setIsSearchOpen(false)} />
          </RegionErrorBoundary>
        )}
      </div>
    </>
  )
}
