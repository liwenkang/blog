import { apiHandler, validateBody, isValidEmail } from '@/lib/core/api-handler'
import { ValidationError, ExternalServiceError } from '@/lib/core/api-errors'
import { env } from '@/lib/config/env'
import { logger } from '@/lib/core/logger'

const buttondownHandler = async (req, res) => {
  const { email } = req.body

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
    logger.error('Buttondown API error', error, {
      email: email.slice(0, 3) + '***',
    })
    throw new ExternalServiceError('Buttondown', error)
  }
}

export default apiHandler(buttondownHandler, { methods: ['POST'] })
