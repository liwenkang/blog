/**
 * 环境配置状态检查 API
 * 用于开发和调试时验证环境变量配置
 */

import { apiHandler } from '@/lib/core/api-handler'
import { UnauthorizedError } from '@/lib/core/api-errors'
import { env, getEnv, getValidationError, hasEnv } from '@/lib/config/env'
import { logger } from '@/lib/core/logger'

const envStatusHandler = async (req, _res) => {
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
    fields: {},
  }

  switch (env.newsletter.provider) {
    case 'mailchimp':
      newsletterStatus.fields = {
        apiKey: hasEnv('MAILCHIMP_API_KEY'),
        server: hasEnv('MAILCHIMP_API_SERVER'),
        audienceId: hasEnv('MAILCHIMP_AUDIENCE_ID'),
      }
      newsletterStatus.configured = Object.values(newsletterStatus.fields).every(Boolean)
      break
    case 'buttondown':
      newsletterStatus.fields = {
        apiKey: hasEnv('BUTTONDOWN_API_KEY'),
      }
      newsletterStatus.configured = hasEnv('BUTTONDOWN_API_KEY')
      break
    case 'convertkit':
      newsletterStatus.fields = {
        apiKey: hasEnv('CONVERTKIT_API_KEY'),
        formId: hasEnv('CONVERTKIT_FORM_ID'),
      }
      newsletterStatus.configured = hasEnv('CONVERTKIT_API_KEY') && hasEnv('CONVERTKIT_FORM_ID')
      break
    // 其他 provider...
  }

  // 检查 Comment 配置
  const commentStatus = {
    provider: env.comment.provider,
    configured: false,
    fields: {},
  }

  switch (env.comment.provider) {
    case 'giscus':
      commentStatus.fields = {
        repo: hasEnv('NEXT_PUBLIC_GISCUS_REPO'),
        repositoryId: hasEnv('NEXT_PUBLIC_GISCUS_REPOSITORY_ID'),
        category: hasEnv('NEXT_PUBLIC_GISCUS_CATEGORY'),
        categoryId: hasEnv('NEXT_PUBLIC_GISCUS_CATEGORY_ID'),
      }
      commentStatus.configured = Object.values(commentStatus.fields).every(Boolean)
      break
    // 其他 provider...
  }

  const responseData = {
    timestamp: new Date().toISOString(),
    environment: env.isDevelopment ? 'development' : 'production',
    validation: {
      success: !validationError,
      error: validationError?.message,
    },
    newsletter: newsletterStatus,
    comment: commentStatus,
    health: {
      newsletter: newsletterStatus.configured,
      comment: commentStatus.configured,
      overall: newsletterStatus.configured && commentStatus.configured,
    },
  }

  logger.info('Environment status checked', {
    health: responseData.health,
  })

  return {
    data: responseData,
    message: 'Environment status retrieved successfully',
  }
}

export default apiHandler(envStatusHandler, { methods: ['GET'] })
