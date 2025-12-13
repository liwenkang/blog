/**
 * 统一错误类定义
 * 用于 API 路由的错误处理
 */

export interface ErrorDetails {
  [key: string]: any
}

export class ApiError extends Error {
  statusCode: number
  code: string
  details: ErrorDetails

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    details: ErrorDetails = {}
  ) {
    super(message)
    this.name = this.constructor.name
    this.statusCode = statusCode
    this.code = code
    this.details = details
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, details: ErrorDetails = {}) {
    super(message, 400, 'VALIDATION_ERROR', details)
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND')
  }
}

export class ConflictError extends ApiError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT')
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED')
  }
}

export class RateLimitError extends ApiError {
  constructor(retryAfter: number = 60) {
    super('Too many requests', 429, 'RATE_LIMIT_EXCEEDED', { retryAfter })
  }
}

export class ExternalServiceError extends ApiError {
  constructor(service: string, originalError: Error) {
    const message = `External service error: ${service}`
    const details = {
      service,
      originalMessage: originalError.message,
      originalStack: originalError.stack,
    }
    super(message, 502, 'EXTERNAL_SERVICE_ERROR', details)
  }
}
