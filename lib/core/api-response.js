/**
 * 统一 API 响应格式
 */

export class ApiResponse {
  /**
   * 成功响应
   * @param {*} data - 响应数据
   * @param {string} message - 成功消息
   * @returns {Object} 格式化的成功响应
   */
  static success(data = null, message = 'Success') {
    return {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    }
  }

  /**
   * 错误响应
   * @param {Error} error - 错误对象
   * @param {number} _statusCode - HTTP 状态码
   * @returns {Object} 格式化的错误响应
   */
  static error(error, _statusCode = 500) {
    const isDev = process.env.NODE_ENV === 'development'

    const response = {
      success: false,
      error: {
        message: error.message || 'Internal Server Error',
        code: error.code || 'INTERNAL_ERROR',
      },
      timestamp: new Date().toISOString(),
    }

    // 只在开发环境返回详细信息
    if (isDev) {
      response.error.stack = error.stack
      if (error.details) {
        response.error.details = error.details
      }
    }

    return response
  }

  /**
   * 分页响应
   * @param {Array} items - 数据项
   * @param {Object} pagination - 分页信息
   * @returns {Object} 格式化的分页响应
   */
  static paginated(items, pagination) {
    return {
      success: true,
      data: items,
      pagination: {
        page: pagination.page,
        pageSize: pagination.pageSize,
        total: pagination.total,
        totalPages: Math.ceil(pagination.total / pagination.pageSize),
      },
      timestamp: new Date().toISOString(),
    }
  }
}

export default ApiResponse
