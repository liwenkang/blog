// 博客文章类型定义
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
  authorDetails?: Author[]
}

// 作者类型定义
export interface Author {
  name: string
  avatar?: string
  twitter?: string
  url?: string
}

// 站点元数据类型
export interface SiteMetadata {
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
  authorDetails?: Author[]
  date: string
  lastmod?: string
  url: string
  images?: string[]
}
