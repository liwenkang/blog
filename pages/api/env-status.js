/**
 * 环境配置状态检查 API
 * 用于开发和调试时验证环境变量配置
 */

import { getEnvValidationStatus } from '@/lib/env-validation'

export default async function handler(req, res) {
  // 只允许在开发环境或通过特定密钥访问
  const isDev = process.env.NODE_ENV === 'development'
  const hasDebugKey = req.headers['x-debug-key'] === process.env.DEBUG_API_KEY

  if (!isDev && !hasDebugKey) {
    return res.status(403).json({
      error: 'Access denied. This endpoint is only available in development mode.',
    })
  }

  try {
    const status = getEnvValidationStatus()

    // 返回详细的环境状态（开发模式）或简化状态（生产模式）
    const responseData = isDev
      ? {
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV,
          ...status,
          rawEnvVars: {
            MAILCHIMP_API_KEY: process.env.MAILCHIMP_API_KEY ? '***configured***' : 'missing',
            MAILCHIMP_API_SERVER: process.env.MAILCHIMP_API_SERVER || 'missing',
            MAILCHIMP_AUDIENCE_ID: process.env.MAILCHIMP_AUDIENCE_ID
              ? '***configured***'
              : 'missing',
            NEXT_PUBLIC_GISCUS_REPO: process.env.NEXT_PUBLIC_GISCUS_REPO || 'missing',
          },
          health: {
            newsletter: status.newsletter.isValid,
            comments: status.comments.isValid,
            overall: status.newsletter.isValid && status.comments.isValid,
          },
        }
      : {
          timestamp: status.timestamp,
          health: {
            newsletter: status.newsletter.isValid,
            comments: status.comments.isValid,
            overall: status.newsletter.isValid && status.comments.isValid,
          },
        }

    res.status(200).json(responseData)
  } catch (error) {
    console.error('Env status check error:', error)
    res.status(500).json({
      error: 'Failed to check environment status',
      message: error.message,
    })
  }
}
