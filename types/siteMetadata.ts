import { AnalyticsConfig } from './analytics'
import { CommentConfig } from './comment'

/**
 * Newsletter 提供商类型
 */
export type NewsletterProvider =
  | 'mailchimp'
  | 'buttondown'
  | 'convertkit'
  | 'klaviyo'
  | 'revue'
  | 'emailoctopus'
  | ''

/**
 * Newsletter 配置
 */
export interface NewsletterConfig {
  provider?: NewsletterProvider
}

/**
 * 网站元数据配置接口
 */
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
  facebook?: string
  youtube?: string
  linkedin?: string
  locale: string
  analytics: {
    plausibleDataDomain?: string
    simpleAnalytics?: boolean
    umamiWebsiteId?: string
    googleAnalyticsId?: string
    posthogAnalyticsId?: string
  }
  newsletter: {
    provider?: NewsletterProvider
  }
  comment: {
    provider?: 'giscus' | 'utterances' | 'disqus' | ''
    giscusConfig?: {
      repo?: string
      repositoryId?: string
      category?: string
      categoryId?: string
      mapping?: string
      reactions?: string
      metadata?: string
      theme?: string
      inputPosition?: string
      lang?: string
      darkTheme?: string
      themeURL?: string
    }
    utterancesConfig?: {
      repo?: string
      issueTerm?: string
      label?: string
      theme?: string
      darkTheme?: string
    }
    disqusConfig?: {
      shortname?: string
    }
  }
}
