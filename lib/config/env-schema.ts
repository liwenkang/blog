/**
 * 环境变量 Schema 定义
 * 使用 Zod 进行运行时类型验证
 */

import { z } from 'zod'

// 基础环境变量 Schema
const baseEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_PUBLIC_LOG_LEVEL: z
    .enum(['DEBUG', 'INFO', 'WARN', 'ERROR', 'SILENT'])
    .default('INFO')
    .optional(),
})

// Sentry 配置 Schema
const sentrySchema = z.object({
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional().or(z.literal('')),
  SENTRY_ORG: z.string().optional().or(z.literal('')),
  SENTRY_PROJECT: z.string().optional().or(z.literal('')),
})

// Newsletter Provider 枚举
const newsletterProviders = z.enum([
  'mailchimp',
  'buttondown',
  'convertkit',
  'klaviyo',
  'revue',
  'emailoctopus',
])

// Newsletter 配置 Schema
const newsletterSchema = z.object({
  NEWSLETTER_PROVIDER: newsletterProviders.default('mailchimp').optional(),

  // Mailchimp
  MAILCHIMP_API_KEY: z.string().optional().or(z.literal('')),
  MAILCHIMP_API_SERVER: z.string().optional().or(z.literal('')),
  MAILCHIMP_AUDIENCE_ID: z.string().optional().or(z.literal('')),

  // ButtonDown
  BUTTONDOWN_API_URL: z.string().url().optional().or(z.literal('')),
  BUTTONDOWN_API_KEY: z.string().optional().or(z.literal('')),

  // ConvertKit
  CONVERTKIT_API_URL: z.string().url().optional().or(z.literal('')),
  CONVERTKIT_API_KEY: z.string().optional().or(z.literal('')),
  CONVERTKIT_FORM_ID: z.string().optional().or(z.literal('')),

  // Klaviyo
  KLAVIYO_API_KEY: z.string().optional().or(z.literal('')),
  KLAVIYO_LIST_ID: z.string().optional().or(z.literal('')),

  // Revue
  REVUE_API_URL: z.string().url().optional().or(z.literal('')),
  REVUE_API_KEY: z.string().optional().or(z.literal('')),

  // EmailOctopus
  EMAILOCTOPUS_API_URL: z.string().url().optional().or(z.literal('')),
  EMAILOCTOPUS_API_KEY: z.string().optional().or(z.literal('')),
  EMAILOCTOPUS_LIST_ID: z.string().optional().or(z.literal('')),
})

// 评论系统 Provider 枚举
const commentProviders = z.enum(['giscus', 'utterances', 'disqus'])

// 评论系统 Schema
const commentSchema = z.object({
  COMMENT_PROVIDER: commentProviders.default('giscus').optional(),

  // Giscus
  NEXT_PUBLIC_GISCUS_REPO: z.string().optional().or(z.literal('')),
  NEXT_PUBLIC_GISCUS_REPOSITORY_ID: z.string().optional().or(z.literal('')),
  NEXT_PUBLIC_GISCUS_CATEGORY: z.string().optional().or(z.literal('')),
  NEXT_PUBLIC_GISCUS_CATEGORY_ID: z.string().optional().or(z.literal('')),

  // Utterances
  NEXT_PUBLIC_UTTERANCES_REPO: z.string().optional().or(z.literal('')),

  // Disqus
  NEXT_PUBLIC_DISQUS_SHORTNAME: z.string().optional().or(z.literal('')),
})

// 分析工具 Schema
const analyticsSchema = z.object({
  NEXT_PUBLIC_GA_ID: z.string().optional().or(z.literal('')),
  NEXT_PUBLIC_PLAUSIBLE_DOMAIN: z.string().optional().or(z.literal('')),
  NEXT_PUBLIC_UMAMI_WEBSITE_ID: z.string().optional().or(z.literal('')),
  NEXT_PUBLIC_POSTHOG_ID: z.string().optional().or(z.literal('')),
})

// 合并所有 Schema
export const envSchema = baseEnvSchema
  .merge(sentrySchema)
  .merge(newsletterSchema)
  .merge(commentSchema)
  .merge(analyticsSchema)

export type EnvSchema = z.infer<typeof envSchema>

/**
 * Newsletter Provider 配置验证规则
 */
const newsletterValidationRules: Record<string, string[]> = {
  mailchimp: ['MAILCHIMP_API_KEY', 'MAILCHIMP_API_SERVER', 'MAILCHIMP_AUDIENCE_ID'],
  buttondown: ['BUTTONDOWN_API_KEY'],
  convertkit: ['CONVERTKIT_API_KEY', 'CONVERTKIT_FORM_ID'],
  klaviyo: ['KLAVIYO_API_KEY', 'KLAVIYO_LIST_ID'],
  revue: ['REVUE_API_KEY'],
  emailoctopus: ['EMAILOCTOPUS_API_KEY', 'EMAILOCTOPUS_LIST_ID'],
}

/**
 * Comment Provider 配置验证规则
 */
const commentValidationRules: Record<string, string[]> = {
  giscus: [
    'NEXT_PUBLIC_GISCUS_REPO',
    'NEXT_PUBLIC_GISCUS_REPOSITORY_ID',
    'NEXT_PUBLIC_GISCUS_CATEGORY',
    'NEXT_PUBLIC_GISCUS_CATEGORY_ID',
  ],
  utterances: ['NEXT_PUBLIC_UTTERANCES_REPO'],
  disqus: ['NEXT_PUBLIC_DISQUS_SHORTNAME'],
}

/**
 * 条件验证：根据 provider 验证对应的必需字段
 */
export function validateEnvWithProvider(env: Record<string, any>): EnvSchema {
  // 首先进行基础验证
  const parsed = envSchema.parse(env)

  const errors: string[] = []

  // Newsletter provider 验证
  const newsletterProvider = parsed.NEWSLETTER_PROVIDER || 'mailchimp'
  const requiredNewsletterFields = newsletterValidationRules[newsletterProvider]

  if (requiredNewsletterFields) {
    const missingFields = requiredNewsletterFields.filter(
      (field) => !parsed[field as keyof EnvSchema] || parsed[field as keyof EnvSchema] === ''
    )

    if (missingFields.length > 0) {
      errors.push(
        `Newsletter provider "${newsletterProvider}" requires: ${missingFields.join(', ')}`
      )
    }
  }

  // Comment provider 验证
  const commentProvider = parsed.COMMENT_PROVIDER || 'giscus'
  const requiredCommentFields = commentValidationRules[commentProvider]

  if (requiredCommentFields) {
    const missingFields = requiredCommentFields.filter(
      (field) => !parsed[field as keyof EnvSchema] || parsed[field as keyof EnvSchema] === ''
    )

    if (missingFields.length > 0) {
      errors.push(`Comment provider "${commentProvider}" requires: ${missingFields.join(', ')}`)
    }
  }

  // 如果有错误,抛出异常
  if (errors.length > 0) {
    throw new Error(`Environment validation failed:\n- ${errors.join('\n- ')}`)
  }

  return parsed
}

/**
 * 宽松验证：只进行基础 schema 验证,不检查 provider 必需字段
 * 用于生产环境或不需要严格验证的场景
 */
export function validateEnvLoose(env: Record<string, any>): EnvSchema {
  return envSchema.parse(env)
}

export default envSchema
