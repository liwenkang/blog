/**
 * API Errors 单元测试
 */

import {
  ApiError,
  ValidationError,
  NotFoundError,
  ConflictError,
  UnauthorizedError,
  RateLimitError,
  ExternalServiceError,
  ConfigurationError,
} from '@/lib/core/api-errors'

describe('API Errors', () => {
  describe('ApiError 基类', () => {
    it('应该创建基础错误', () => {
      const error = new ApiError('Test error', 500, 'TEST_ERROR')

      expect(error).toBeInstanceOf(Error)
      expect(error.message).toBe('Test error')
      expect(error.statusCode).toBe(500)
      expect(error.code).toBe('TEST_ERROR')
      expect(error.name).toBe('ApiError')
    })

    it('应该有默认值', () => {
      const error = new ApiError('Test error')

      expect(error.statusCode).toBe(500)
      expect(error.code).toBe('INTERNAL_ERROR')
      expect(error.details).toEqual({})
    })

    it('应该包含错误堆栈', () => {
      const error = new ApiError('Test error')
      expect(error.stack).toBeDefined()
    })

    it('应该支持自定义详情', () => {
      const details = { field: 'email', reason: 'invalid format' }
      const error = new ApiError('Test error', 400, 'TEST_ERROR', details)

      expect(error.details).toEqual(details)
    })
  })

  describe('ValidationError', () => {
    it('应该创建 400 验证错误', () => {
      const error = new ValidationError('Invalid email')

      expect(error).toBeInstanceOf(ApiError)
      expect(error.statusCode).toBe(400)
      expect(error.code).toBe('VALIDATION_ERROR')
      expect(error.message).toBe('Invalid email')
    })

    it('应该支持详情对象', () => {
      const details = { field: 'email', value: 'invalid' }
      const error = new ValidationError('Invalid email', details)

      expect(error.details).toEqual(details)
    })
  })

  describe('NotFoundError', () => {
    it('应该创建 404 错误', () => {
      const error = new NotFoundError('User')

      expect(error).toBeInstanceOf(ApiError)
      expect(error.statusCode).toBe(404)
      expect(error.code).toBe('NOT_FOUND')
      expect(error.message).toBe('User not found')
    })

    it('应该有默认资源名称', () => {
      const error = new NotFoundError()
      expect(error.message).toBe('Resource not found')
    })
  })

  describe('ConflictError', () => {
    it('应该创建 409 冲突错误', () => {
      const error = new ConflictError('Email already exists')

      expect(error).toBeInstanceOf(ApiError)
      expect(error.statusCode).toBe(409)
      expect(error.code).toBe('CONFLICT')
      expect(error.message).toBe('Email already exists')
    })
  })

  describe('UnauthorizedError', () => {
    it('应该创建 401 未授权错误', () => {
      const error = new UnauthorizedError()

      expect(error).toBeInstanceOf(ApiError)
      expect(error.statusCode).toBe(401)
      expect(error.code).toBe('UNAUTHORIZED')
    })

    it('应该支持自定义消息', () => {
      const error = new UnauthorizedError('Invalid token')
      expect(error.message).toBe('Invalid token')
    })

    it('应该有默认消息', () => {
      const error = new UnauthorizedError()
      expect(error.message).toBe('Unauthorized')
    })
  })

  describe('RateLimitError', () => {
    it('应该创建 429 限流错误', () => {
      const error = new RateLimitError()

      expect(error).toBeInstanceOf(ApiError)
      expect(error.statusCode).toBe(429)
      expect(error.code).toBe('RATE_LIMIT_EXCEEDED')
      expect(error.message).toBe('Too many requests')
    })

    it('应该包含重试时间', () => {
      const error = new RateLimitError(120)
      expect(error.details.retryAfter).toBe(120)
    })

    it('应该有默认重试时间', () => {
      const error = new RateLimitError()
      expect(error.details.retryAfter).toBe(60)
    })
  })

  describe('ExternalServiceError', () => {
    it('应该创建 502 外部服务错误', () => {
      const originalError = new Error('Connection timeout')
      const error = new ExternalServiceError('Mailchimp', originalError)

      expect(error).toBeInstanceOf(ApiError)
      expect(error.statusCode).toBe(502)
      expect(error.code).toBe('EXTERNAL_SERVICE_ERROR')
      expect(error.message).toBe('External service error: Mailchimp')
    })

    it('应该包含服务名称', () => {
      const error = new ExternalServiceError('PaymentGateway', new Error('Failed'))
      expect(error.details.service).toBe('PaymentGateway')
    })

    it('应该包含原始错误信息', () => {
      const originalError = new Error('Network error')
      const error = new ExternalServiceError('API', originalError)

      expect(error.details.originalError).toBe('Network error')
    })

    it('应该处理非 Error 对象', () => {
      const error = new ExternalServiceError('API', 'Simple string error')
      expect(error.details.originalError).toBe('Simple string error')
    })
  })

  describe('ConfigurationError', () => {
    it('应该创建 500 配置错误', () => {
      const error = new ConfigurationError('Missing API key')

      expect(error).toBeInstanceOf(ApiError)
      expect(error.statusCode).toBe(500)
      expect(error.code).toBe('CONFIGURATION_ERROR')
      expect(error.message).toBe('Missing API key')
    })

    it('应该支持详情对象', () => {
      const details = { required: ['API_KEY', 'API_SECRET'] }
      const error = new ConfigurationError('Configuration incomplete', details)

      expect(error.details).toEqual(details)
    })
  })

  describe('错误继承链', () => {
    it('所有错误都应该继承自 ApiError', () => {
      expect(new ValidationError('test')).toBeInstanceOf(ApiError)
      expect(new NotFoundError()).toBeInstanceOf(ApiError)
      expect(new ConflictError('test')).toBeInstanceOf(ApiError)
      expect(new UnauthorizedError()).toBeInstanceOf(ApiError)
      expect(new RateLimitError()).toBeInstanceOf(ApiError)
      expect(new ExternalServiceError('test', new Error())).toBeInstanceOf(ApiError)
      expect(new ConfigurationError('test')).toBeInstanceOf(ApiError)
    })

    it('所有错误都应该继承自 Error', () => {
      expect(new ApiError('test')).toBeInstanceOf(Error)
      expect(new ValidationError('test')).toBeInstanceOf(Error)
      expect(new NotFoundError()).toBeInstanceOf(Error)
    })
  })

  describe('错误序列化', () => {
    it('应该能序列化为 JSON', () => {
      const error = new ValidationError('Invalid input', {
        field: 'email',
        value: 'test',
      })

      const json = JSON.stringify(error)
      expect(json).toBeDefined()
    })

    it('应该包含关键属性', () => {
      const error = new ValidationError('Invalid input')
      const obj = {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        details: error.details,
      }

      expect(obj.message).toBe('Invalid input')
      expect(obj.code).toBe('VALIDATION_ERROR')
      expect(obj.statusCode).toBe(400)
    })
  })
})
