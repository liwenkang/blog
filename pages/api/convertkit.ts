import type { NextApiRequest, NextApiResponse } from 'next'
import { apiHandler, validateBody, isValidEmail } from '@/lib/core/api-handler'
import { ValidationError, ExternalServiceError } from '@/lib/core/api-errors'
import { env } from '@/lib/config/env'
import { logger } from '@/lib/core/logger'

interface ConvertkitRequestBody {
  email: string
}

interface ConvertkitResponse {
  statusCode: number
  data: { subscribed: boolean }
  message: string
}

const convertkitHandler = async (
  req: NextApiRequest,
  _res: NextApiResponse
): Promise<ConvertkitResponse> => {
  const { email } = req.body as ConvertkitRequestBody

  validateBody(req.body, ['email'])

  if (!isValidEmail(email)) {
    throw new ValidationError('Invalid email address format')
  }

  const { apiKey, formId, apiUrl } = env.newsletter.convertkit

  if (!apiKey || !formId) {
    throw new ExternalServiceError('ConvertKit', new Error('API key or Form ID not configured'))
  }

  try {
    const response = await fetch(`${apiUrl}forms/${formId}/subscribe`, {
      body: JSON.stringify({ email, api_key: apiKey }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`ConvertKit API error: ${response.status} - ${errorText}`)
    }

    logger.success('ConvertKit subscription successful', {
      email: email.slice(0, 3) + '***',
    })

    return {
      statusCode: 201,
      data: { subscribed: true },
      message: 'Successfully subscribed to newsletter',
    }
  } catch (error) {
    logger.error('ConvertKit API error', error as Error, {
      email: email.slice(0, 3) + '***',
    })
    throw new ExternalServiceError('ConvertKit', error as Error)
  }
}

export default apiHandler(convertkitHandler, { methods: ['POST'] })
