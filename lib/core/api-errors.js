/**
 * 统一错误类定义
 * 用于 API 路由的错误处理
 */

export class ApiError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = {}) {
    super(message)
    this.name = this.constructor.name
    this.statusCode = statusCode
    this.code = code
    this.details = details
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends ApiError {
  constructor(message, details = {}) {
    super(message, 400, 'VALIDATION_ERROR', details)
  }
}

export class NotFoundError extends ApiError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND')
  }
}

export class ConflictError extends ApiError {
  constructor(message) {
    super(message, 409, 'CONFLICT')
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED')
  }
}

export class RateLimitError extends ApiError {
  constructor(retryAfter = 60) {
    super('Too many requests', 429, 'RATE_LIMIT_EXCEEDED', { retryAfter })
  }
}

export class ExternalServiceError extends ApiError {
  constructor(service, originalError) {
    const message = `External service error: ${service}`
    const details = {
      service,
      originalError: originalError?.message || String(originalError),
    }
    super(message, 502, 'EXTERNAL_SERVICE_ERROR', details)
  }
}

export class ConfigurationError extends ApiError {
  constructor(message, details = {}) {
    super(message, 500, 'CONFIGURATION_ERROR', details)
  }
}
