import { apiHandler, validateBody, isValidEmail } from '@/lib/core/api-handler'
import { ValidationError, ExternalServiceError } from '@/lib/core/api-errors'
import { env } from '@/lib/config/env'
import { logger } from '@/lib/core/logger'

const klaviyoHandler = async (req, res) => {
  const { email } = req.body

  validateBody(req.body, ['email'])

  if (!isValidEmail(email)) {
    throw new ValidationError('Invalid email address format')
  }

  const { apiKey, listId } = env.newsletter.klaviyo

  if (!apiKey || !listId) {
    throw new ExternalServiceError('Klaviyo', new Error('API key or List ID not configured'))
  }

  try {
    const response = await fetch(
      `https://a.klaviyo.com/api/v2/list/${listId}/subscribe?api_key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profiles: [{ email }],
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Klaviyo API error: ${response.status} - ${errorText}`)
    }

    logger.success('Klaviyo subscription successful', {
      email: email.slice(0, 3) + '***',
    })

    return {
      statusCode: 201,
      data: { subscribed: true },
      message: 'Successfully subscribed to newsletter',
    }
  } catch (error) {
    logger.error('Klaviyo API error', error, {
      email: email.slice(0, 3) + '***',
    })
    throw new ExternalServiceError('Klaviyo', error)
  }
}

export default apiHandler(klaviyoHandler, { methods: ['POST'] })
