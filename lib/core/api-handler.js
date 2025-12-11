/**
 * API 路由处理器包装器
 * 提供统一的错误处理、日志记录、方法验证
 */

import { logger } from './logger'
import { ApiResponse } from './api-response'
import { ApiError } from './api-errors'

/**
 * API 处理器包装函数
 * @param {Function} handler - API 处理函数
 * @param {Object} options - 配置选项
 * @param {Array<string>} options.methods - 允许的 HTTP 方法
 * @param {boolean} options.requireAuth - 是否需要认证
 * @returns {Function} 包装后的处理函数
 */
export function apiHandler(handler, options = {}) {
  return async (req, res) => {
    const startTime = Date.now()
    const { method, url } = req

    try {
      // 方法验证
      if (options.methods && !options.methods.includes(method)) {
        throw new ApiError(`Method ${method} not allowed`, 405, 'METHOD_NOT_ALLOWED')
      }

      // 这里可以添加认证逻辑
      if (options.requireAuth) {
        // TODO: 实现认证检查
      }

      // 执行处理器
      const result = await handler(req, res)

      // 如果处理器已经发送响应，直接返回
      if (res.headersSent) {
        return
      }

      // 发送成功响应
      const statusCode = result?.statusCode || 200
      const responseData = result?.data !== undefined ? result.data : result
      const message = result?.message || 'Success'

      res.status(statusCode).json(ApiResponse.success(responseData, message))

      // 记录成功日志
      logger.api(method, url, statusCode, {
        duration: Date.now() - startTime,
      })
    } catch (error) {
      // 如果已经发送响应，只记录错误
      if (res.headersSent) {
        logger.error('Error after response sent', error, {
          method,
          url,
        })
        return
      }

      // 确定状态码
      const statusCode = error instanceof ApiError ? error.statusCode : 500

      // 记录错误日志
      logger.error(`API Error: ${method} ${url}`, error, {
        statusCode,
        duration: Date.now() - startTime,
        body: req.body,
        query: req.query,
      })

      // 发送错误响应
      res.status(statusCode).json(ApiResponse.error(error, statusCode))
    }
  }
}

/**
 * 验证请求体
 * @param {Object} body - 请求体
 * @param {Array<string>} requiredFields - 必需字段
 * @throws {ApiError} 如果验证失败
 */
export function validateBody(body, requiredFields) {
  const missing = requiredFields.filter((field) => !body || !body[field])

  if (missing.length > 0) {
    throw new ApiError(`Missing required fields: ${missing.join(', ')}`, 400, 'VALIDATION_ERROR', {
      missingFields: missing,
    })
  }
}

/**
 * 验证邮箱格式
 * @param {string} email - 邮箱地址
 * @returns {boolean} 是否有效
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export default apiHandler
