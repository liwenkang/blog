import { apiHandler, validateBody, isValidEmail } from '@/lib/core/api-handler'
import { ValidationError, ExternalServiceError } from '@/lib/core/api-errors'
import { env } from '@/lib/config/env'
import { logger } from '@/lib/core/logger'

const emailoctopusHandler = async (req, _res) => {
  const { email } = req.body

  validateBody(req.body, ['email'])

  if (!isValidEmail(email)) {
    throw new ValidationError('Invalid email address format')
  }

  const { apiKey, listId, apiUrl } = env.newsletter.emailoctopus

  if (!apiKey || !listId) {
    throw new ExternalServiceError('EmailOctopus', new Error('API key or List ID not configured'))
  }

  try {
    const response = await fetch(`${apiUrl}lists/${listId}/contacts`, {
      body: JSON.stringify({ email_address: email, api_key: apiKey }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`EmailOctopus API error: ${response.status} - ${errorText}`)
    }

    logger.success('EmailOctopus subscription successful', {
      email: email.slice(0, 3) + '***',
    })

    return {
      statusCode: 201,
      data: { subscribed: true },
      message: 'Successfully subscribed to newsletter',
    }
  } catch (error) {
    logger.error('EmailOctopus API error', error, {
      email: email.slice(0, 3) + '***',
    })
    throw new ExternalServiceError('EmailOctopus', error)
  }
}

export default apiHandler(emailoctopusHandler, { methods: ['POST'] })
