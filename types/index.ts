/**
 * 中心化类型导出
 * 整合了所有项目类型定义，提供统一的导入入口
 */

// 作者相关类型
export type { Author, AuthorFrontMatter } from './author'

// 文章相关类型
export type { PostFrontMatter, Post, PostNavigation } from './post'

// 导航相关类型
export type { NavLink } from './navigation'

// Analytics 相关类型
export type { AnalyticsConfig } from './analytics'

// 评论系统相关类型
export type { GiscusConfig, UtterancesConfig, DisqusConfig, CommentConfig } from './comment'

// 网站元数据相关类型
export type { SiteMetadata, NewsletterConfig, NewsletterProvider } from './siteMetadata'

// ===== 以下为向后兼容的类型别名 =====

// 重新导出 Author 作为命名导出以便本地使用
import { Author as AuthorType } from './author'

// 博客文章类型定义（向后兼容）
export interface BlogPost {
  slug: string
  title: string
  date: string
  lastmod?: string
  summary?: string
  tags: string[]
  draft: boolean
  images?: string[]
  canonicalUrl?: string
  authorDetails?: AuthorType[]
}

// ===== 保留旧的站点元数据定义（向后兼容） =====
export interface LegacySiteMetadata {
  title: string
  author: string
  headerTitle: string
  description: string
  language: string
  theme: 'system' | 'dark' | 'light'
  siteUrl: string
  siteRepo: string
  siteLogo: string
  image: string
  socialBanner: string
  email: string
  github: string
  twitter: string
  locale: string
  analytics: {
    plausibleDataDomain: string
    simpleAnalytics: boolean
    umamiWebsiteId: string
    googleAnalyticsId: string
    posthogAnalyticsId: string
  }
  newsletter: {
    provider: string
  }
  comment: {
    provider: 'giscus' | 'utterances' | 'disqus'
    giscusConfig: {
      repo: string
      repositoryId: string
      category: string
      categoryId: string
      mapping: string
      reactions: string
      metadata: string
      theme: string
      inputPosition: string
      lang: string
      darkTheme: string
      themeURL: string
    }
    utterancesConfig: {
      repo: string
      issueTerm: string
      label: string
      theme: string
      darkTheme: string
    }
    disqusConfig: {
      shortname: string
    }
  }
}

// SEO相关类型
export interface SEOProps {
  title: string
  description: string
  ogType?: 'website' | 'article'
  ogImage?: string | { url: string }[]
  twImage?: string
  canonicalUrl?: string
}

// 博客文章SEO类型
export interface BlogSEOProps extends SEOProps {
  authorDetails?: AuthorType[]
  date: string
  lastmod?: string
  url: string
  images?: string[]
}
