// CommonJS friendly logger for Node scripts, aligned with app logger behavior

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  SILENT: 4,
}

function getLogLevel() {
  const envLevel = process.env.NEXT_PUBLIC_LOG_LEVEL || 'INFO'
  return LOG_LEVELS[envLevel] ?? LOG_LEVELS.INFO
}

class ScriptLogger {
  constructor() {
    this.level = getLogLevel()
    this.isDev = process.env.NODE_ENV !== 'production'
  }

  shouldLog(level) {
    return LOG_LEVELS[level] >= this.level
  }

  format(level, message, meta = {}) {
    const timestamp = new Date().toISOString()
    if (this.isDev) {
      return { timestamp, level, message, ...meta }
    }
    return { timestamp, level, message, ...(Object.keys(meta).length ? { meta } : {}) }
  }

  debug(message, meta = {}) {
    if (this.isDev && this.shouldLog('DEBUG')) console.log('🔍 [DEBUG]', message, meta)
  }
  info(message, meta = {}) {
    if (!this.shouldLog('INFO')) return
    if (this.isDev) console.log('ℹ️  [INFO]', message, meta)
    else console.log(JSON.stringify(this.format('INFO', message, meta)))
  }
  warn(message, meta = {}) {
    if (!this.shouldLog('WARN')) return
    if (this.isDev) console.warn('⚠️  [WARN]', message, meta)
    else console.warn(JSON.stringify(this.format('WARN', message, meta)))
  }
  error(message, error = null, meta = {}) {
    if (!this.shouldLog('ERROR')) return
    const merged = error
      ? {
          message: error.message,
          stack: this.isDev ? error.stack : undefined,
          name: error.name,
          ...meta,
        }
      : meta
    if (this.isDev) console.error('❌ [ERROR]', message, merged)
    else console.error(JSON.stringify(this.format('ERROR', message, merged)))
  }
  success(message, meta = {}) {
    if (!this.shouldLog('INFO')) return
    if (this.isDev) console.log('✅ [SUCCESS]', message, meta)
    else console.log(JSON.stringify(this.format('INFO', message, meta)))
  }
}

const logger = new ScriptLogger()

module.exports = { logger, LOG_LEVELS, ScriptLogger }
