import { apiHandler, validateBody, isValidEmail } from '@/lib/core/api-handler'
import { ValidationError, ExternalServiceError } from '@/lib/core/api-errors'
import { env } from '@/lib/config/env'
import { logger } from '@/lib/core/logger'

const revueHandler = async (req, _res) => {
  const { email } = req.body

  validateBody(req.body, ['email'])

  if (!isValidEmail(email)) {
    throw new ValidationError('Invalid email address format')
  }

  const { apiKey, apiUrl } = env.newsletter.revue

  if (!apiKey) {
    throw new ExternalServiceError('Revue', new Error('API key not configured'))
  }

  try {
    const response = await fetch(`${apiUrl}subscribers`, {
      method: 'POST',
      headers: {
        Authorization: `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, double_opt_in: false }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Revue API error: ${response.status} - ${errorText}`)
    }

    logger.success('Revue subscription successful', {
      email: email.slice(0, 3) + '***',
    })

    return {
      statusCode: 201,
      data: { subscribed: true },
      message: 'Successfully subscribed to newsletter',
    }
  } catch (error) {
    logger.error('Revue API error', error, {
      email: email.slice(0, 3) + '***',
    })
    throw new ExternalServiceError('Revue', error)
  }
}

export default apiHandler(revueHandler, { methods: ['POST'] })
