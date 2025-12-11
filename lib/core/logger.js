/**
 * 统一日志管理系统
 * 支持不同环境、日志级别、结构化输出
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  SILENT: 4,
}

class Logger {
  constructor() {
    this.level = this.getLogLevel()
    this.isDev = process.env.NODE_ENV === 'development'
    this.isServer = typeof window === 'undefined'
  }

  getLogLevel() {
    const envLevel = process.env.NEXT_PUBLIC_LOG_LEVEL || 'INFO'
    return LOG_LEVELS[envLevel] || LOG_LEVELS.INFO
  }

  shouldLog(level) {
    return LOG_LEVELS[level] >= this.level
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString()
    const context = this.isServer ? '[Server]' : '[Client]'

    // 开发环境返回详细格式，生产环境返回简洁格式
    if (this.isDev) {
      return {
        timestamp,
        level,
        context,
        message,
        ...meta,
      }
    }

    return {
      timestamp,
      level,
      message,
      ...(Object.keys(meta).length > 0 && { meta }),
    }
  }

  debug(message, meta = {}) {
    if (this.shouldLog('DEBUG') && this.isDev) {
      console.log('🔍 [DEBUG]', message, meta)
    }
  }

  info(message, meta = {}) {
    if (this.shouldLog('INFO')) {
      const formatted = this.formatMessage('INFO', message, meta)
      if (this.isDev) {
        console.log('ℹ️  [INFO]', message, meta)
      } else {
        console.log(JSON.stringify(formatted))
      }
    }
  }

  warn(message, meta = {}) {
    if (this.shouldLog('WARN')) {
      const formatted = this.formatMessage('WARN', message, meta)
      if (this.isDev) {
        console.warn('⚠️  [WARN]', message, meta)
      } else {
        console.warn(JSON.stringify(formatted))
      }
    }
  }

  error(message, error = null, meta = {}) {
    if (this.shouldLog('ERROR')) {
      const errorData = error
        ? {
            message: error?.message,
            stack: this.isDev ? error?.stack : undefined,
            name: error?.name,
            ...meta,
          }
        : meta

      const formatted = this.formatMessage('ERROR', message, errorData)

      if (this.isDev) {
        console.error('❌ [ERROR]', message, errorData)
      } else {
        console.error(JSON.stringify(formatted))
      }

      // 生产环境发送到 Sentry
      if (!this.isDev && typeof window !== 'undefined' && error) {
        this.sendToSentry(error, meta)
      }
    }
  }

  sendToSentry(error, meta = {}) {
    // 动态导入 Sentry 避免影响构建
    if (typeof window !== 'undefined') {
      try {
        import('@sentry/nextjs')
          .then(({ captureException }) => {
            captureException(error, {
              extra: meta,
              level: 'error',
            })
          })
          .catch(() => {
            // Sentry 不可用时静默失败
          })
      } catch (e) {
        // 静默失败
      }
    }
  }

  // 用于 API 日志
  api(method, url, status, meta = {}) {
    const statusEmoji = status >= 500 ? '🔴' : status >= 400 ? '🟡' : '🟢'
    const message = `${method} ${url} - ${status}`

    if (status >= 500) {
      this.error(message, null, meta)
    } else if (status >= 400) {
      this.warn(message, meta)
    } else {
      this.info(`${statusEmoji} ${message}`, meta)
    }
  }

  // 用于性能日志
  perf(metric, value, meta = {}) {
    if (this.isDev && this.shouldLog('DEBUG')) {
      this.debug(`⚡ Performance: ${metric} = ${value}ms`, meta)
    }
  }

  // 用于成功操作日志
  success(message, meta = {}) {
    if (this.shouldLog('INFO')) {
      if (this.isDev) {
        console.log('✅ [SUCCESS]', message, meta)
      } else {
        this.info(message, meta)
      }
    }
  }
}

// 导出单例
export const logger = new Logger()

// 便捷方法导出
export const { debug, info, warn, error, api, perf, success } = logger

// 导出 LOG_LEVELS 和 Logger 类供测试使用
export { LOG_LEVELS, Logger }

export default logger
