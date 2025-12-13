/**
 * Analytics 配置类型定义
 */
export interface AnalyticsConfig {
  plausibleDataDomain?: string
  simpleAnalytics?: boolean
  umamiWebsiteId?: string
  googleAnalyticsId?: string
  posthogAnalyticsId?: string
}
