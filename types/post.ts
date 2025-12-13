/**
 * 博客文章类型定义
 */

/**
 * 文章基础 FrontMatter 接口
 * 从 lib/mdx.ts 导出的 FrontMatter 的增强版本
 */
export interface PostFrontMatter {
  title: string
  date: string
  tags?: string[]
  lastmod?: string
  draft?: boolean
  summary?: string
  excerpt?: string
  images?: string[]
  authors?: string[]
  layout?: string
  bibliography?: string
  canonicalUrl?: string
  slug?: string
  fileName?: string
  [key: string]: any
}

/**
 * 带有完整内容的文章数据
 */
export interface Post {
  mdxSource: any
  toc: any[]
  frontMatter: PostFrontMatter
}

/**
 * 文章导航链接（上一篇/下一篇）
 */
export interface PostNavigation {
  slug?: string | null
  title?: string
  date?: string
}
