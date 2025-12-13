/**
 * 环境配置状态检查 API
 * 用于开发和调试时验证环境变量配置
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { apiHandler } from '@/lib/core/api-handler'
import { UnauthorizedError } from '@/lib/core/api-errors'
import { env, getEnv, getValidationError, hasEnv } from '@/lib/config/env'
import { logger } from '@/lib/core/logger'

interface EnvStatusResponse {
  environment: {
    isDevelopment: boolean
    isProduction: boolean
    nodeEnv: string
  }
  validation: {
    isValid: boolean
    error: string | null
  }
  newsletter: {
    provider: string | null
    configured: boolean
    fields: Record<string, boolean>
  }
  monitoring: {
    sentry: {
      configured: boolean
      dsn: string | null
    }
    logging: {
      enabled: boolean
      level: string
    }
  }
  features: {
    analytics: boolean
    comments: boolean
    search: boolean
  }
}

const envStatusHandler = async (
  req: NextApiRequest,
  _res: NextApiResponse
): Promise<{ data: EnvStatusResponse }> => {
  // 只允许在开发环境或通过特定密钥访问
  const isDev = env.isDevelopment
  const hasDebugKey = req.headers['x-debug-key'] === process.env.DEBUG_API_KEY

  if (!isDev && !hasDebugKey) {
    throw new UnauthorizedError(
      'Access denied. This endpoint is only available in development mode.'
    )
  }

  // 获取环境变量
  getEnv()
  const validationError = getValidationError()

  // 检查 Newsletter 配置
  const newsletterStatus = {
    provider: env.newsletter.provider,
    configured: false,
    fields: {} as Record<string, boolean>,
  }

  // 根据不同的 provider 检查相应的字段
  switch (env.newsletter.provider) {
    case 'mailchimp':
      newsletterStatus.fields = {
        apiKey: hasEnv('MAILCHIMP_API_KEY'),
        server: hasEnv('MAILCHIMP_API_SERVER'),
        audienceId: hasEnv('MAILCHIMP_AUDIENCE_ID'),
      }
      newsletterStatus.configured =
        newsletterStatus.fields.apiKey &&
        newsletterStatus.fields.server &&
        newsletterStatus.fields.audienceId
      break

    case 'buttondown':
      newsletterStatus.fields = {
        apiKey: hasEnv('BUTTONDOWN_API_KEY'),
      }
      newsletterStatus.configured = newsletterStatus.fields.apiKey
      break

    case 'convertkit':
      newsletterStatus.fields = {
        apiKey: hasEnv('CONVERTKIT_API_KEY'),
        formId: hasEnv('CONVERTKIT_FORM_ID'),
      }
      newsletterStatus.configured = newsletterStatus.fields.apiKey && newsletterStatus.fields.formId
      break

    case 'klaviyo':
      newsletterStatus.fields = {
        apiKey: hasEnv('KLAVIYO_API_KEY'),
        listId: hasEnv('KLAVIYO_LIST_ID'),
      }
      newsletterStatus.configured = newsletterStatus.fields.apiKey && newsletterStatus.fields.listId
      break

    case 'emailoctopus':
      newsletterStatus.fields = {
        apiKey: hasEnv('EMAILOCTOPUS_API_KEY'),
        listId: hasEnv('EMAILOCTOPUS_LIST_ID'),
      }
      newsletterStatus.configured = newsletterStatus.fields.apiKey && newsletterStatus.fields.listId
      break

    default:
      break
  }

  const status: EnvStatusResponse = {
    environment: {
      isDevelopment: env.isDevelopment,
      isProduction: env.isProduction,
      nodeEnv: process.env.NODE_ENV || 'unknown',
    },
    validation: {
      isValid: !validationError,
      error: validationError?.message || null,
    },
    newsletter: newsletterStatus,
    monitoring: {
      sentry: {
        configured: hasEnv('NEXT_PUBLIC_SENTRY_DSN'),
        dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || null,
      },
      logging: {
        enabled: env.logging.enabled,
        level: env.logging.level,
      },
    },
    features: {
      analytics: hasEnv('NEXT_PUBLIC_UMAMI_WEBSITE_ID'),
      comments: hasEnv('GISCUS_REPO'),
      search: hasEnv('NEXT_PUBLIC_ALGOLIA_APP_ID') || true, // 默认支持本地搜索
    },
  }

  logger.info('Environment status checked', {
    provider: env.newsletter.provider,
    configured: newsletterStatus.configured,
  })

  return { data: status }
}

export default apiHandler(envStatusHandler, {
  methods: ['GET'],
})
