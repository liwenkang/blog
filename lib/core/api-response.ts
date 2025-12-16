/**
 * 统一 API 响应格式
 */

export interface ApiSuccessResponse<T = any> {
  success: true
  message: string
  data: T
  timestamp: string
}

export interface ApiErrorResponse {
  success: false
  error: {
    message: string
    code: string
    stack?: string
    details?: any
  }
  timestamp: string
}

export class ApiResponse {
  /**
   * 成功响应
   * @param data - 响应数据
   * @param message - 成功消息
   * @returns 格式化的成功响应
   */
  static success<T = any>(data: T = null as T, message: string = 'Success'): ApiSuccessResponse<T> {
    return {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    }
  }

  /**
   * 错误响应
   * @param error - 错误对象
   * @param _statusCode - HTTP 状态码
   * @returns 格式化的错误响应
   */
  static error(error: any, _statusCode: number = 500): ApiErrorResponse {
    const isDev = process.env.NODE_ENV !== 'production'

    const response: ApiErrorResponse = {
      success: false,
      error: {
        message: error.message || 'Internal Server Error',
        code: error.code || 'INTERNAL_ERROR',
      },
      timestamp: new Date().toISOString(),
    }

    // 只在开发环境返回详细信息
    if (isDev) {
      if (error.stack) {
        response.error.stack = error.stack
      }
      if (error.details) {
        response.error.details = error.details
      }
    }

    return response
  }

  /**
   * 分页响应
   * @param data - 数据数组
   * @param page - 当前页码
   * @param limit - 每页数量
   * @param total - 总数
   * @returns 格式化的分页响应
   */
  static paginated<T = any>(data: T[], page: number, limit: number, total: number) {
    return this.success({
      items: data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    })
  }
}
