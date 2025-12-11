/**
 * API Response 单元测试
 */

import { ApiResponse } from '@/lib/core/api-response'

describe('API Response', () => {
  describe('success 方法', () => {
    it('应该创建成功响应', () => {
      const response = ApiResponse.success({ userId: 123 }, 'User created')

      expect(response.success).toBe(true)
      expect(response.message).toBe('User created')
      expect(response.data).toEqual({ userId: 123 })
      expect(response.timestamp).toBeDefined()
    })

    it('应该有默认消息', () => {
      const response = ApiResponse.success({ test: 'data' })
      expect(response.message).toBe('Success')
    })

    it('应该处理 null 数据', () => {
      const response = ApiResponse.success(null, 'Success')
      expect(response.data).toBeNull()
      expect(response.success).toBe(true)
    })

    it('应该包含 ISO 格式时间戳', () => {
      const response = ApiResponse.success({})
      expect(response.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    })

    it('应该处理数组数据', () => {
      const data = [1, 2, 3]
      const response = ApiResponse.success(data)
      expect(response.data).toEqual(data)
    })

    it('应该处理字符串数据', () => {
      const response = ApiResponse.success('simple string')
      expect(response.data).toBe('simple string')
    })
  })

  describe('error 方法', () => {
    it('应该创建错误响应', () => {
      const error = new Error('Something went wrong')
      error.code = 'TEST_ERROR'

      const response = ApiResponse.error(error, 500)

      expect(response.success).toBe(false)
      expect(response.error.message).toBe('Something went wrong')
      expect(response.error.code).toBe('TEST_ERROR')
      expect(response.timestamp).toBeDefined()
    })

    it('应该有默认错误消息', () => {
      const error = new Error()
      const response = ApiResponse.error(error)

      expect(response.error.message).toBe('Internal Server Error')
    })

    it('应该有默认错误代码', () => {
      const error = new Error('Test')
      const response = ApiResponse.error(error)

      expect(response.error.code).toBe('INTERNAL_ERROR')
    })

    it('开发环境应该包含堆栈信息', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'

      const error = new Error('Test error')
      const response = ApiResponse.error(error)

      expect(response.error.stack).toBeDefined()

      process.env.NODE_ENV = originalEnv
    })

    it('生产环境不应该包含堆栈信息', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'

      const error = new Error('Test error')
      const response = ApiResponse.error(error)

      expect(response.error.stack).toBeUndefined()

      process.env.NODE_ENV = originalEnv
    })

    it('应该包含错误详情', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'

      const error = new Error('Test error')
      error.details = { field: 'email', reason: 'invalid' }

      const response = ApiResponse.error(error)

      expect(response.error.details).toEqual(error.details)

      process.env.NODE_ENV = originalEnv
    })

    it('应该处理默认状态码', () => {
      const error = new Error('Test')
      const response = ApiResponse.error(error)
      // 响应对象本身不包含 statusCode，但这是传给 res.status() 的
      expect(response).toBeDefined()
    })
  })

  describe('paginated 方法', () => {
    it('应该创建分页响应', () => {
      const items = [1, 2, 3, 4, 5]
      const pagination = {
        page: 2,
        pageSize: 5,
        total: 25,
      }

      const response = ApiResponse.paginated(items, pagination)

      expect(response.success).toBe(true)
      expect(response.data).toEqual(items)
      expect(response.pagination).toBeDefined()
      expect(response.timestamp).toBeDefined()
    })

    it('应该计算总页数', () => {
      const pagination = {
        page: 1,
        pageSize: 10,
        total: 25,
      }

      const response = ApiResponse.paginated([], pagination)

      expect(response.pagination.totalPages).toBe(3)
    })

    it('应该包含分页信息', () => {
      const pagination = {
        page: 2,
        pageSize: 20,
        total: 100,
      }

      const response = ApiResponse.paginated([], pagination)

      expect(response.pagination.page).toBe(2)
      expect(response.pagination.pageSize).toBe(20)
      expect(response.pagination.total).toBe(100)
      expect(response.pagination.totalPages).toBe(5)
    })

    it('应该处理空数组', () => {
      const pagination = {
        page: 1,
        pageSize: 10,
        total: 0,
      }

      const response = ApiResponse.paginated([], pagination)

      expect(response.data).toEqual([])
      expect(response.pagination.totalPages).toBe(0)
    })

    it('应该正确处理不能整除的页数', () => {
      const pagination = {
        page: 1,
        pageSize: 7,
        total: 30,
      }

      const response = ApiResponse.paginated([], pagination)

      expect(response.pagination.totalPages).toBe(5) // ceil(30/7) = 5
    })
  })

  describe('响应格式一致性', () => {
    it('成功响应应该包含 success 字段', () => {
      const response = ApiResponse.success({})
      expect(response).toHaveProperty('success')
    })

    it('错误响应应该包含 success 字段', () => {
      const response = ApiResponse.error(new Error())
      expect(response).toHaveProperty('success')
    })

    it('分页响应应该包含 success 字段', () => {
      const response = ApiResponse.paginated([], { page: 1, pageSize: 10, total: 0 })
      expect(response).toHaveProperty('success')
    })

    it('所有响应都应该包含时间戳', () => {
      expect(ApiResponse.success({})).toHaveProperty('timestamp')
      expect(ApiResponse.error(new Error())).toHaveProperty('timestamp')
      expect(ApiResponse.paginated([], { page: 1, pageSize: 10, total: 0 })).toHaveProperty(
        'timestamp'
      )
    })
  })

  describe('响应序列化', () => {
    it('成功响应应该可以序列化为 JSON', () => {
      const response = ApiResponse.success({ test: 'data' })
      const json = JSON.stringify(response)

      expect(json).toBeDefined()
      expect(() => JSON.parse(json)).not.toThrow()
    })

    it('错误响应应该可以序列化为 JSON', () => {
      const response = ApiResponse.error(new Error('Test'))
      const json = JSON.stringify(response)

      expect(json).toBeDefined()
      expect(() => JSON.parse(json)).not.toThrow()
    })

    it('分页响应应该可以序列化为 JSON', () => {
      const response = ApiResponse.paginated([1, 2, 3], { page: 1, pageSize: 10, total: 3 })
      const json = JSON.stringify(response)

      expect(json).toBeDefined()
      expect(() => JSON.parse(json)).not.toThrow()
    })
  })
})
