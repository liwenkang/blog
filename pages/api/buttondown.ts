import type { NextApiRequest, NextApiResponse } from 'next'
import { apiHandler, validateBody, isValidEmail } from '@/lib/core/api-handler'
import { ValidationError, ExternalServiceError } from '@/lib/core/api-errors'
import { env } from '@/lib/config/env'
import { logger } from '@/lib/core/logger'

interface ButtondownRequestBody {
  email: string
}

interface ButtondownResponse {
  statusCode: number
  data: { subscribed: boolean }
  message: string
}

const buttondownHandler = async (
  req: NextApiRequest,
  _res: NextApiResponse
): Promise<ButtondownResponse> => {
  const { email } = req.body as ButtondownRequestBody

  validateBody(req.body, ['email'])

  if (!isValidEmail(email)) {
    throw new ValidationError('Invalid email address format')
  }

  const { apiKey, apiUrl } = env.newsletter.buttondown

  if (!apiKey) {
    throw new ExternalServiceError('Buttondown', new Error('API key not configured'))
  }

  try {
    const response = await fetch(`${apiUrl}subscribers`, {
      body: JSON.stringify({ email }),
      headers: {
        Authorization: `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Buttondown API error: ${response.status} - ${errorText}`)
    }

    logger.success('Buttondown subscription successful', {
      email: email.slice(0, 3) + '***',
    })

    return {
      statusCode: 201,
      data: { subscribed: true },
      message: 'Successfully subscribed to newsletter',
    }
  } catch (error) {
    logger.error('Buttondown API error', error as Error, {
      email: email.slice(0, 3) + '***',
    })
    throw new ExternalServiceError('Buttondown', error as Error)
  }
}

export default apiHandler(buttondownHandler, { methods: ['POST'] })
