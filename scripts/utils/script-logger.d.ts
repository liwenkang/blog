/**
 * Type definitions for script-logger.js
 */

export interface LogMetadata {
  [key: string]: any
}

export class ScriptLogger {
  level: number
  isDev: boolean

  shouldLog(level: string): boolean
  format(level: string, message: string, meta?: LogMetadata): Record<string, any>
  debug(message: string, meta?: LogMetadata): void
  info(message: string, meta?: LogMetadata): void
  warn(message: string, meta?: LogMetadata): void
  error(message: string, error?: Error | null, meta?: LogMetadata): void
  success(message: string, meta?: LogMetadata): void
  perf(metric: string, value: number, meta?: LogMetadata): void
}

export const logger: ScriptLogger
