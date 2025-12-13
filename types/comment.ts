/**
 * 评论系统配置类型定义
 */

/**
 * Giscus 配置
 */
export interface GiscusConfig {
  repo?: string
  repositoryId?: string
  category?: string
  categoryId?: string
  mapping?: string
  reactions?: string
  metadata?: string
  theme?: string
  darkTheme?: string
  themeURL?: string
  lang?: string
}

/**
 * Utterances 配置
 */
export interface UtterancesConfig {
  repo?: string
  issueTerm?: string
  label?: string
  theme?: string
  darkTheme?: string
}

/**
 * Disqus 配置
 */
export interface DisqusConfig {
  shortname?: string
}

/**
 * 评论系统总配置
 */
export interface CommentConfig {
  provider?: 'giscus' | 'utterances' | 'disqus' | ''
  giscusConfig?: GiscusConfig
  utterancesConfig?: UtterancesConfig
  disqusConfig?: DisqusConfig
}
