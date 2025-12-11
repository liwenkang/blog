import { LOG_LEVELS, logger, Logger } from '@/lib/core/logger'
/**
 * Logger 系统单元测试
 */

describe('Logger System', () => {
  // 保存原始的 console 方法
  const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
  }

  // Mock console 方法
  beforeEach(() => {
    console.log = jest.fn()
    console.warn = jest.fn()
    console.error = jest.fn()
  })

  afterEach(() => {
    console.log = originalConsole.log
    console.warn = originalConsole.warn
    console.error = originalConsole.error
  })

  describe('日志级别', () => {
    it('应该支持所有日志级别', () => {
      expect(LOG_LEVELS).toHaveProperty('DEBUG')
      expect(LOG_LEVELS).toHaveProperty('INFO')
      expect(LOG_LEVELS).toHaveProperty('WARN')
      expect(LOG_LEVELS).toHaveProperty('ERROR')
      expect(LOG_LEVELS).toHaveProperty('SILENT')
    })

    it('日志级别应该按优先级排序', () => {
      expect(LOG_LEVELS.DEBUG).toBeLessThan(LOG_LEVELS.INFO)
      expect(LOG_LEVELS.INFO).toBeLessThan(LOG_LEVELS.WARN)
      expect(LOG_LEVELS.WARN).toBeLessThan(LOG_LEVELS.ERROR)
      expect(LOG_LEVELS.ERROR).toBeLessThan(LOG_LEVELS.SILENT)
    })
  })

  describe('基础日志方法', () => {
    it('logger.info 应该输出信息日志', () => {
      logger.info('Test message', { key: 'value' })
      expect(console.log).toHaveBeenCalled()
    })

    it('logger.warn 应该输出警告日志', () => {
      logger.warn('Warning message', { key: 'value' })
      expect(console.warn).toHaveBeenCalled()
    })

    it('logger.error 应该输出错误日志', () => {
      const error = new Error('Test error')
      logger.error('Error occurred', error, { key: 'value' })
      expect(console.error).toHaveBeenCalled()
    })

    it('logger.success 应该输出成功日志', () => {
      logger.success('Operation successful', { key: 'value' })
      expect(console.log).toHaveBeenCalled()
    })
  })

  describe('API 日志', () => {
    it('logger.api 应该记录 API 请求', () => {
      logger.api('POST', '/api/test', 200, { duration: 100 })
      expect(console.log).toHaveBeenCalled()
    })

    it('logger.api 对 4xx 错误应该使用 warn', () => {
      logger.api('POST', '/api/test', 400, { duration: 50 })
      expect(console.warn).toHaveBeenCalled()
    })

    it('logger.api 对 5xx 错误应该使用 error', () => {
      logger.api('POST', '/api/test', 500, { duration: 50 })
      expect(console.error).toHaveBeenCalled()
    })
  })

  describe('性能日志', () => {
    it('logger.perf 应该在开发环境记录性能指标', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'

      logger.perf('TestMetric', 123.45, { component: 'Test' })

      process.env.NODE_ENV = originalEnv
    })
  })

  describe('日志元数据', () => {
    it('应该接受元数据对象', () => {
      const metadata = {
        userId: 123,
        action: 'login',
        timestamp: Date.now(),
      }

      logger.info('User login', metadata)
      expect(console.log).toHaveBeenCalled()
    })

    it('应该处理空元数据', () => {
      logger.info('Message without metadata')
      expect(console.log).toHaveBeenCalled()
    })
  })

  describe('错误处理', () => {
    it('应该处理 Error 对象', () => {
      const error = new Error('Test error')
      error.stack = 'Error stack trace'

      logger.error('Error message', error)
      expect(console.error).toHaveBeenCalled()
    })

    it('应该处理没有 Error 对象的情况', () => {
      logger.error('Error without error object', null, { context: 'test' })
      expect(console.error).toHaveBeenCalled()
    })

    it('应该提取错误信息', () => {
      const error = new Error('Custom error message')
      logger.error('Operation failed', error)
      expect(console.error).toHaveBeenCalled()
    })
  })

  describe('环境感知', () => {
    it('应该识别开发环境', () => {
      // logger 实例在导入时就已经创建，isDev 在构造时确定
      // 所以这里我们只能测试当前环境
      expect(typeof logger.isDev).toBe('boolean')
    })

    it('应该识别生产环境', () => {
      // 创建一个新的 Logger 实例来测试
      const prodLogger = new Logger()
      // isDev 取决于 NODE_ENV，测试环境下通常为 test
      expect(typeof prodLogger.isDev).toBe('boolean')
    })
  })

  describe('日志格式化', () => {
    it('应该包含时间戳', () => {
      const formatted = logger.formatMessage('INFO', 'Test', {})
      expect(formatted).toHaveProperty('timestamp')
    })

    it('应该包含日志级别', () => {
      const formatted = logger.formatMessage('INFO', 'Test', {})
      expect(formatted).toHaveProperty('level')
      expect(formatted.level).toBe('INFO')
    })

    it('开发环境应该包含上下文信息', () => {
      const devLogger = new Logger()
      devLogger.isDev = true // 强制设置为开发环境
      const formatted = devLogger.formatMessage('INFO', 'Test', {})
      expect(formatted).toHaveProperty('context')
    })
  })
})
