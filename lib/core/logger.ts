/**
 * 统一日志管理系统
 * 支持不同环境、日志级别、结构化输出
 */

export const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  SILENT: 4,
} as const

type LogLevel = keyof typeof LOG_LEVELS

interface LogMetadata {
  [key: string]: any
}

interface FormattedMessage {
  timestamp: string
  level: LogLevel
  context?: string
  message: string
  meta?: LogMetadata
  [key: string]: any
}

export class Logger {
  private readonly level: number
  private readonly isDev: boolean
  private readonly isServer: boolean

  constructor() {
    this.level = this.getLogLevel()
    this.isDev = process.env.NODE_ENV === 'development'
    this.isServer = globalThis.window === undefined
  }

  private getLogLevel(): number {
    const envLevel = (process.env.NEXT_PUBLIC_LOG_LEVEL || 'INFO') as LogLevel
    return LOG_LEVELS[envLevel] || LOG_LEVELS.INFO
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= this.level
  }

  private formatMessage(
    level: LogLevel,
    message: string,
    meta: LogMetadata = {}
  ): FormattedMessage {
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

  debug(message: string, meta: LogMetadata = {}): void {
    if (this.shouldLog('DEBUG') && this.isDev) {
      console.log('🔍 [DEBUG]', message, meta)
    }
  }

  info(message: string, meta: LogMetadata = {}): void {
    if (this.shouldLog('INFO')) {
      const formatted = this.formatMessage('INFO', message, meta)
      if (this.isDev) {
        console.log('ℹ️  [INFO]', message, meta)
      } else {
        console.log(JSON.stringify(formatted))
      }
    }
  }

  warn(message: string, meta: LogMetadata = {}): void {
    if (this.shouldLog('WARN')) {
      const formatted = this.formatMessage('WARN', message, meta)
      if (this.isDev) {
        console.warn('⚠️  [WARN]', message, meta)
      } else {
        console.warn(JSON.stringify(formatted))
      }
    }
  }

  error(message: string, error: Error | null = null, meta: LogMetadata = {}): void {
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
      if (!this.isDev && globalThis.window !== undefined && error) {
        this.sendToSentry(error, meta)
      }
    }
  }

  private sendToSentry(error: Error, meta: LogMetadata = {}): void {
    // 动态导入 Sentry 避免影响构建
    if (globalThis.window !== undefined) {
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
    }
  }

  // 用于 API 日志
  api(method: string, url: string, status: number, meta: LogMetadata = {}): void {
    let statusEmoji = '🟢'
    if (status >= 500) {
      statusEmoji = '🔴'
    } else if (status >= 400) {
      statusEmoji = '🟡'
    }
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
  perf(metric: string, value: number, meta: LogMetadata = {}): void {
    if (this.isDev && this.shouldLog('DEBUG')) {
      this.debug(`⚡ Performance: ${metric} = ${value}ms`, meta)
    }
  }

  // 用于成功操作日志
  success(message: string, meta: LogMetadata = {}): void {
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

export default logger
