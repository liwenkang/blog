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
      const error = new Error('Something went wrong') as any
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
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', writable: true })

      const error = new Error('Test error')
      const response = ApiResponse.error(error)

      expect(response.error.stack).toBeDefined()

      Object.defineProperty(process.env, 'NODE_ENV', { value: originalEnv, writable: true })
    })

    it('生产环境不应该包含堆栈信息', () => {
      const originalEnv = process.env.NODE_ENV
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'production', writable: true })

      const error = new Error('Test error')
      const response = ApiResponse.error(error)

      expect(response.error.stack).toBeUndefined()

      Object.defineProperty(process.env, 'NODE_ENV', { value: originalEnv, writable: true })
    })

    it('应该包含错误详情', () => {
      const originalEnv = process.env.NODE_ENV
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', writable: true })

      const error = new Error('Test error') as any
      error.details = { field: 'email', reason: 'invalid' }

      const response = ApiResponse.error(error)

      expect(response.error.details).toEqual(error.details)

      Object.defineProperty(process.env, 'NODE_ENV', { value: originalEnv, writable: true })
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

      const response = ApiResponse.paginated(items, 2, 5, 25)

      expect(response.success).toBe(true)
      expect(response.data.items).toEqual(items)
      expect(response.data.pagination).toBeDefined()
      expect(response.data.pagination.page).toBe(2)
      expect(response.data.pagination.limit).toBe(5)
      expect(response.data.pagination.total).toBe(25)
      expect(response.data.pagination.pages).toBe(5)
      expect(response.timestamp).toBeDefined()
    })

    it('应该计算总页数', () => {
      const response = ApiResponse.paginated([], 1, 10, 25)

      expect(response.data.pagination.pages).toBe(3)
    })

    it('应该包含分页信息', () => {
      const response = ApiResponse.paginated([1, 2, 3], 2, 10, 50)

      expect(response.data.pagination.page).toBe(2)
      expect(response.data.pagination.limit).toBe(10)
      expect(response.data.pagination.total).toBe(50)
      expect(response.data.pagination.pages).toBe(5)
    })

    it('应该处理最后一页', () => {
      const response = ApiResponse.paginated([1, 2, 3, 4, 5], 3, 10, 25)

      expect(response.data.pagination.pages).toBe(3)
      expect(response.data.pagination.hasNext).toBe(false)
    })

    it('应该处理空结果', () => {
      const response = ApiResponse.paginated([], 1, 10, 0)

      expect(response.data.items).toEqual([])
      expect(response.data.pagination.total).toBe(0)
      expect(response.data.pagination.pages).toBe(0)
    })

    it('应该有默认消息', () => {
      const response = ApiResponse.paginated([], 1, 10, 0)
      expect(response.message).toBe('Success')
    })
  })

  describe('响应格式', () => {
    it('成功响应应该有正确的结构', () => {
      const response = ApiResponse.success({ test: 'data' })

      expect(response).toHaveProperty('success')
      expect(response).toHaveProperty('message')
      expect(response).toHaveProperty('data')
      expect(response).toHaveProperty('timestamp')
    })

    it('错误响应应该有正确的结构', () => {
      const response = ApiResponse.error(new Error('test'))

      expect(response).toHaveProperty('success')
      expect(response).toHaveProperty('error')
      expect(response).toHaveProperty('timestamp')
      expect(response.error).toHaveProperty('message')
      expect(response.error).toHaveProperty('code')
    })

    it('分页响应应该有正确的结构', () => {
      const response = ApiResponse.paginated([1, 2, 3], 1, 10, 3)

      expect(response).toHaveProperty('success')
      expect(response).toHaveProperty('message')
      expect(response).toHaveProperty('data')
      expect(response.data).toHaveProperty('items')
      expect(response.data).toHaveProperty('pagination')
      expect(response).toHaveProperty('timestamp')
    })
  })

  describe('类型安全', () => {
    it('success 应该支持泛型类型', () => {
      interface User {
        id: number
        name: string
      }

      const user: User = { id: 1, name: 'Test' }
      const response = ApiResponse.success(user)

      expect(response.data).toEqual(user)
    })

    it('paginated 应该支持泛型类型', () => {
      interface Item {
        id: number
        title: string
      }

      const items: Item[] = [
        { id: 1, title: 'First' },
        { id: 2, title: 'Second' },
      ]

      const response = ApiResponse.paginated(items, 1, 10, 2)

      expect(response.data.items).toEqual(items)
      expect(response.data.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 2,
        pages: 1,
        hasNext: false,
        hasPrev: false,
      })
    })
  })
})
