import mailchimp from '@mailchimp/mailchimp_marketing'
import type { NextApiRequest, NextApiResponse } from 'next'
import { apiHandler, validateBody, isValidEmail } from '@/lib/core/api-handler'
import { ValidationError, ConflictError, ExternalServiceError } from '@/lib/core/api-errors'
import { env } from '@/lib/config/env'
import { logger } from '@/lib/core/logger'

interface MailchimpConfig {
  audienceId: string
}

// 配置 Mailchimp
const configureMailchimp = (): MailchimpConfig => {
  const { apiKey, server, audienceId } = env.newsletter.mailchimp

  if (!apiKey || !server || !audienceId) {
    throw new Error(
      'Mailchimp configuration incomplete. Required: MAILCHIMP_API_KEY, MAILCHIMP_API_SERVER, MAILCHIMP_AUDIENCE_ID'
    )
  }

  mailchimp.setConfig({
    apiKey,
    server,
  })

  return { audienceId }
}

interface MailchimpRequestBody {
  email: string
}

interface MailchimpResponse {
  statusCode: number
  data: { subscribed: boolean }
  message: string
}

// Mailchimp 订阅处理器
const mailchimpHandler = async (
  req: NextApiRequest,
  _res: NextApiResponse
): Promise<MailchimpResponse> => {
  const { email } = req.body as MailchimpRequestBody

  // 验证请求体
  validateBody(req.body, ['email'])

  // 验证邮箱格式
  if (!isValidEmail(email)) {
    throw new ValidationError('Invalid email address format')
  }

  // 配置 Mailchimp
  let config: MailchimpConfig
  try {
    config = configureMailchimp()
  } catch (error) {
    logger.error('Mailchimp configuration error', error as Error)
    throw new ExternalServiceError('Mailchimp', error as Error)
  }

  try {
    // 添加订阅者
    const result = await mailchimp.lists.addListMember(config.audienceId, {
      email_address: email,
      status: 'subscribed',
    })

    logger.success('Mailchimp subscription successful', {
      email: email.slice(0, 3) + '***',
      memberId: result.id,
    })

    return {
      statusCode: 201,
      data: { subscribed: true },
      message: 'Successfully subscribed to newsletter',
    }
  } catch (error: any) {
    // 处理 Mailchimp 特定错误
    if (error.message?.includes('already a member') || error.message?.includes('is already')) {
      throw new ConflictError('You are already subscribed to the newsletter')
    }

    if (error.message?.includes('Invalid Resource') || error.message?.includes('invalid')) {
      throw new ValidationError('Invalid email address')
    }

    // 其他错误
    logger.error('Mailchimp API error', error, {
      email: email.slice(0, 3) + '***',
      status: error.status,
    })

    throw new ExternalServiceError('Mailchimp', error)
  }
}

// 导出包装后的处理器
export default apiHandler(mailchimpHandler, {
  methods: ['POST'],
})
