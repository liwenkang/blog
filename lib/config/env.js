/**
 * 类型安全的环境变量访问
 * 提供统一的环境变量读取接口
 */

import { validateEnvWithProvider, validateEnvLoose } from './env-schema.js'

let _env = null
let _validationError = null

/**
 * 获取验证后的环境变量
 * @param {boolean} strict - 是否使用严格验证
 * @returns {Object} 验证后的环境变量对象
 */
export function getEnv(strict = false) {
  if (_env) return _env

  try {
    // 开发环境进行严格验证
    if (process.env.NODE_ENV === 'development' && strict) {
      _env = validateEnvWithProvider(process.env)

      // 动态导入 logger 避免循环依赖
      if (typeof console !== 'undefined') {
        console.log('✅ Environment variables validated successfully')
      }
    } else {
      // 生产环境或非严格模式只进行基础解析
      _env = validateEnvLoose(process.env)
    }

    return _env
  } catch (error) {
    _validationError = error

    // 记录错误
    if (typeof console !== 'undefined') {
      console.error('❌ Environment validation failed:', error.message)
    }

    // 开发环境抛出错误
    if (process.env.NODE_ENV === 'development' && strict) {
      throw error
    }

    // 生产环境返回原始 process.env（降级策略）
    if (typeof console !== 'undefined') {
      console.warn('⚠️  Using raw process.env due to validation failure')
    }
    return process.env
  }
}

/**
 * 获取环境变量验证错误
 * @returns {Error|null} 验证错误对象
 */
export function getValidationError() {
  return _validationError
}

/**
 * 安全访问环境变量
 * @param {string} key - 环境变量键名
 * @param {*} defaultValue - 默认值
 * @returns {*} 环境变量值或默认值
 */
export function getEnvVar(key, defaultValue = undefined) {
  const env = getEnv()
  const value = env[key]

  // 处理空字符串
  if (value === '') {
    return defaultValue
  }

  return value ?? defaultValue
}

/**
 * 检查必需的环境变量
 * @param {string} key - 环境变量键名
 * @returns {string} 环境变量值
 * @throws {Error} 如果环境变量不存在
 */
export function requireEnv(key) {
  const value = getEnvVar(key)
  if (!value) {
    throw new Error(`Required environment variable ${key} is not set`)
  }
  return value
}

/**
 * 检查环境变量是否存在且非空
 * @param {string} key - 环境变量键名
 * @returns {boolean} 是否存在
 */
export function hasEnv(key) {
  const value = getEnvVar(key)
  return value !== undefined && value !== null && value !== ''
}

/**
 * 导出常用环境变量的便捷访问对象
 */
export const env = {
  // 环境判断
  get isDevelopment() {
    return getEnvVar('NODE_ENV') === 'development'
  },
  get isProduction() {
    return getEnvVar('NODE_ENV') === 'production'
  },
  get isTest() {
    return getEnvVar('NODE_ENV') === 'test'
  },

  // 日志配置
  get logLevel() {
    return getEnvVar('NEXT_PUBLIC_LOG_LEVEL', 'INFO')
  },

  // Newsletter 配置
  get newsletter() {
    const provider = getEnvVar('NEWSLETTER_PROVIDER', 'mailchimp')
    return {
      provider,
      mailchimp: {
        apiKey: getEnvVar('MAILCHIMP_API_KEY'),
        server: getEnvVar('MAILCHIMP_API_SERVER'),
        audienceId: getEnvVar('MAILCHIMP_AUDIENCE_ID'),
      },
      buttondown: {
        apiKey: getEnvVar('BUTTONDOWN_API_KEY'),
        apiUrl: getEnvVar('BUTTONDOWN_API_URL', 'https://buttondown.email/v1/subscribers'),
      },
      convertkit: {
        apiKey: getEnvVar('CONVERTKIT_API_KEY'),
        formId: getEnvVar('CONVERTKIT_FORM_ID'),
        apiUrl: getEnvVar('CONVERTKIT_API_URL', 'https://api.convertkit.com/v3/'),
      },
      klaviyo: {
        apiKey: getEnvVar('KLAVIYO_API_KEY'),
        listId: getEnvVar('KLAVIYO_LIST_ID'),
      },
      revue: {
        apiKey: getEnvVar('REVUE_API_KEY'),
        apiUrl: getEnvVar('REVUE_API_URL', 'https://www.getrevue.co/api/v2/'),
      },
      emailoctopus: {
        apiKey: getEnvVar('EMAILOCTOPUS_API_KEY'),
        listId: getEnvVar('EMAILOCTOPUS_LIST_ID'),
        apiUrl: getEnvVar('EMAILOCTOPUS_API_URL', 'https://emailoctopus.com/api/1.6/'),
      },
    }
  },

  // 评论系统配置
  get comment() {
    const provider = getEnvVar('COMMENT_PROVIDER', 'giscus')
    return {
      provider,
      giscus: {
        repo: getEnvVar('NEXT_PUBLIC_GISCUS_REPO'),
        repositoryId: getEnvVar('NEXT_PUBLIC_GISCUS_REPOSITORY_ID'),
        category: getEnvVar('NEXT_PUBLIC_GISCUS_CATEGORY'),
        categoryId: getEnvVar('NEXT_PUBLIC_GISCUS_CATEGORY_ID'),
      },
      utterances: {
        repo: getEnvVar('NEXT_PUBLIC_UTTERANCES_REPO'),
      },
      disqus: {
        shortname: getEnvVar('NEXT_PUBLIC_DISQUS_SHORTNAME'),
      },
    }
  },

  // Sentry 配置
  get sentry() {
    return {
      dsn: getEnvVar('NEXT_PUBLIC_SENTRY_DSN'),
      org: getEnvVar('SENTRY_ORG'),
      project: getEnvVar('SENTRY_PROJECT'),
    }
  },

  // Analytics 配置
  get analytics() {
    return {
      googleAnalyticsId: getEnvVar('NEXT_PUBLIC_GA_ID'),
      plausibleDomain: getEnvVar('NEXT_PUBLIC_PLAUSIBLE_DOMAIN'),
      umamiWebsiteId: getEnvVar('NEXT_PUBLIC_UMAMI_WEBSITE_ID'),
      posthogId: getEnvVar('NEXT_PUBLIC_POSTHOG_ID'),
    }
  },
}

export default env
