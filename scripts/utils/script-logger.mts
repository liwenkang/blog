/**
 * 脚本日志工具
 * 专门用于 Node.js 脚本的日志输出,保持与应用 logger 一致的行为
 */

export const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  SILENT: 4,
} as const

type LogLevel = keyof typeof LOG_LEVELS

export type LogMetadata = Record<string, unknown>

function getLogLevel(): number {
  const level = process.env.LOG_LEVEL || 'info'
  const key = level.toUpperCase() as LogLevel
  return LOG_LEVELS[key] ?? LOG_LEVELS.INFO
}

export class ScriptLogger {
  level: number
  isDev: boolean

  constructor() {
    this.level = getLogLevel()
    this.isDev = process.env.NODE_ENV !== 'production'
  }

  shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= this.level
  }

  format(level: LogLevel, message: string, meta: LogMetadata = {}): Record<string, unknown> {
    const timestamp = new Date().toISOString()
    if (this.isDev) {
      return { timestamp, level, message, ...meta }
    }
    return { timestamp, level, message, ...(Object.keys(meta).length ? { meta } : {}) }
  }

  debug(message: string, meta: LogMetadata = {}): void {
    if (this.isDev && this.shouldLog('DEBUG')) {
      console.log('🔍 [DEBUG]', message, meta)
    }
  }

  info(message: string, meta: LogMetadata = {}): void {
    if (!this.shouldLog('INFO')) return
    if (this.isDev) {
      console.log('ℹ️  [INFO]', message, meta)
    } else {
      console.log(JSON.stringify(this.format('INFO', message, meta)))
    }
  }

  warn(message: string, meta: LogMetadata = {}): void {
    if (!this.shouldLog('WARN')) return
    if (this.isDev) {
      console.warn('⚠️  [WARN]', message, meta)
    } else {
      console.warn(JSON.stringify(this.format('WARN', message, meta)))
    }
  }

  error(message: string, error: Error | null = null, meta: LogMetadata = {}): void {
    if (!this.shouldLog('ERROR')) return

    const errorMeta: LogMetadata =
      error != null
        ? {
            error: error.message,
            stack: error.stack,
            name: error.name,
            ...meta,
          }
        : meta

    if (this.isDev) {
      console.error('❌ [ERROR]', message, errorMeta)
      if (error) console.error(error)
    } else {
      console.error(JSON.stringify(this.format('ERROR', message, errorMeta)))
    }
  }

  success(message: string, meta: LogMetadata = {}): void {
    if (this.isDev && this.shouldLog('INFO')) {
      console.log('✅ [SUCCESS]', message, meta)
    }
  }

  perf(metric: string, value: number, meta: LogMetadata = {}): void {
    if (this.isDev && this.shouldLog('DEBUG')) {
      console.log('⚡ [PERF]', metric, value, meta)
    }
  }
}

export const logger = new ScriptLogger()
