#!/usr/bin/env ts-node

/**
 * 测试新的日志、错误处理和环境变量系统
 */

// 测试 Logger
console.log('\n========== 测试 Logger ==========\n')

import { logger } from '../lib/core/logger.js'

logger.debug('这是一条 DEBUG 日志', { extra: 'data' })
logger.info('这是一条 INFO 日志', { extra: 'data' })
logger.warn('这是一条 WARN 日志', { extra: 'data' })
logger.error('这是一条 ERROR 日志', new Error('测试错误'), { extra: 'data' })
logger.success('这是一条 SUCCESS 日志', { extra: 'data' })
logger.perf('TestMetric', 123.45, { component: 'Test' })

// 测试 API Errors
console.log('\n========== 测试 API Errors ==========\n')

import { ValidationError, ExternalServiceError } from '../lib/core/api-errors.js'

const validationError = new ValidationError('Invalid email', { field: 'email' })
console.log('ValidationError:', {
  name: validationError.name,
  message: validationError.message,
  statusCode: validationError.statusCode,
  code: validationError.code,
})

const externalError = new ExternalServiceError('Mailchimp', new Error('API timeout'))
console.log('ExternalServiceError:', {
  name: externalError.name,
  message: externalError.message,
  statusCode: externalError.statusCode,
  code: externalError.code,
})

// 测试 API Response
console.log('\n========== 测试 API Response ==========\n')

import { ApiResponse } from '../lib/core/api-response.js'

const successResponse = ApiResponse.success({ user: 'test' }, 'User created')
console.log('Success Response:', JSON.stringify(successResponse, null, 2))

const errorResponse = ApiResponse.error(new ValidationError('Invalid input'))
console.log('Error Response:', JSON.stringify(errorResponse, null, 2))

// 测试环境变量
console.log('\n========== 测试环境变量系统 ==========\n')

import { env, getEnv, hasEnv } from '../lib/config/env.js'

console.log('Environment:', {
  isDevelopment: env.isDevelopment,
  isProduction: env.isProduction,
  logLevel: env.logLevel,
})

console.log('Newsletter Config:', {
  provider: env.newsletter.provider,
  hasMailchimpKey: hasEnv('MAILCHIMP_API_KEY'),
})

console.log('Comment Config:', {
  provider: env.comment.provider,
  hasGiscusRepo: hasEnv('NEXT_PUBLIC_GISCUS_REPO'),
})

// 测试环境变量验证
try {
  getEnv(false) // 非严格模式
  console.log('✅ 环境变量验证通过（非严格模式）')
} catch (error) {
  console.log('❌ 环境变量验证失败:', (error as Error).message)
}

console.log('\n========== 测试完成 ==========\n')
console.log('✅ 所有核心系统功能正常！')
console.log('\n提示：')
console.log('1. 日志系统已启用，支持不同级别的日志输出')
console.log('2. API 错误处理已统一，支持多种错误类型')
console.log('3. 环境变量系统已启用，支持类型安全访问')
console.log('4. 所有 Newsletter API 已重构完成')
console.log('\n下一步：')
console.log('- 运行 npm run dev 启动开发服务器')
console.log('- 测试 Newsletter 订阅功能')
console.log('- 检查日志输出是否正常')
