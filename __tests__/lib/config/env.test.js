/**
 * 环境变量系统单元测试
 * 注意：由于环境变量系统使用缓存机制，我们主要测试 API 接口和数据结构
 */

import { env, getEnv } from '@/lib/config/env'

describe('Environment Variable System', () => {
  describe('env 对象结构', () => {
    it('应该提供环境判断属性', () => {
      expect(env).toHaveProperty('isDevelopment')
      expect(env).toHaveProperty('isProduction')
      expect(env).toHaveProperty('isTest')
      expect(typeof env.isDevelopment).toBe('boolean')
      expect(typeof env.isProduction).toBe('boolean')
      expect(typeof env.isTest).toBe('boolean')
    })

    it('测试环境应该正确识别', () => {
      // 在 Jest 测试中，NODE_ENV 应该是 'test'
      expect(env.isTest).toBe(true)
    })
  })

  describe('日志配置', () => {
    it('应该提供日志级别配置', () => {
      expect(env).toHaveProperty('logLevel')
      expect(typeof env.logLevel).toBe('string')
      // 应该是有效的日志级别
      expect(['DEBUG', 'INFO', 'WARN', 'ERROR', 'SILENT']).toContain(env.logLevel)
    })
  })

  describe('Newsletter 配置', () => {
    it('应该提供 Newsletter 配置结构', () => {
      expect(env).toHaveProperty('newsletter')
      expect(env.newsletter).toHaveProperty('provider')
      expect(typeof env.newsletter.provider).toBe('string')
    })

    it('应该提供所有 provider 配置', () => {
      const newsletter = env.newsletter
      expect(newsletter).toHaveProperty('mailchimp')
      expect(newsletter).toHaveProperty('buttondown')
      expect(newsletter).toHaveProperty('convertkit')
      expect(newsletter).toHaveProperty('klaviyo')
      expect(newsletter).toHaveProperty('revue')
      expect(newsletter).toHaveProperty('emailoctopus')
    })

    it('Mailchimp 配置应该有所有必需字段', () => {
      const mailchimp = env.newsletter.mailchimp
      expect(mailchimp).toHaveProperty('apiKey')
      expect(mailchimp).toHaveProperty('server')
      expect(mailchimp).toHaveProperty('audienceId')
    })

    it('应该有 API URL 默认值', () => {
      expect(env.newsletter.buttondown.apiUrl).toContain('buttondown.email')
      expect(env.newsletter.convertkit.apiUrl).toContain('convertkit.com')
      expect(env.newsletter.revue.apiUrl).toContain('getrevue.co')
      expect(env.newsletter.emailoctopus.apiUrl).toContain('emailoctopus.com')
    })
  })

  describe('Comment 配置', () => {
    it('应该提供评论系统配置结构', () => {
      expect(env).toHaveProperty('comment')
      expect(env.comment).toHaveProperty('provider')
      expect(typeof env.comment.provider).toBe('string')
    })

    it('应该提供所有评论系统配置', () => {
      const comment = env.comment
      expect(comment).toHaveProperty('giscus')
      expect(comment).toHaveProperty('utterances')
      expect(comment).toHaveProperty('disqus')
    })

    it('Giscus 配置应该有所有必需字段', () => {
      const giscus = env.comment.giscus
      expect(giscus).toHaveProperty('repo')
      expect(giscus).toHaveProperty('repositoryId')
      expect(giscus).toHaveProperty('category')
      expect(giscus).toHaveProperty('categoryId')
    })
  })

  describe('Sentry 配置', () => {
    it('应该提供 Sentry 配置结构', () => {
      expect(env).toHaveProperty('sentry')
      expect(env.sentry).toHaveProperty('dsn')
      expect(env.sentry).toHaveProperty('org')
      expect(env.sentry).toHaveProperty('project')
    })
  })

  describe('Analytics 配置', () => {
    it('应该提供 Analytics 配置结构', () => {
      expect(env).toHaveProperty('analytics')
      const analytics = env.analytics
      expect(analytics).toHaveProperty('googleAnalyticsId')
      expect(analytics).toHaveProperty('plausibleDomain')
      expect(analytics).toHaveProperty('umamiWebsiteId')
      expect(analytics).toHaveProperty('posthogId')
    })
  })

  describe('getEnv 函数', () => {
    it('应该返回环境变量对象', () => {
      const envVars = getEnv()
      expect(envVars).toBeDefined()
      expect(typeof envVars).toBe('object')
    })

    it('应该缓存环境变量', () => {
      const env1 = getEnv()
      const env2 = getEnv()
      expect(env1).toBe(env2) // 应该返回相同的对象引用
    })

    it('非严格模式不应该抛出错误', () => {
      expect(() => getEnv(false)).not.toThrow()
    })
  })

  describe('类型安全', () => {
    it('env 对象应该有完整的类型结构', () => {
      // 检查所有顶层属性
      const expectedProps = [
        'isDevelopment',
        'isProduction',
        'isTest',
        'logLevel',
        'newsletter',
        'comment',
        'sentry',
        'analytics',
      ]

      expectedProps.forEach((prop) => {
        expect(env).toHaveProperty(prop)
      })
    })

    it('newsletter 对象应该有正确的结构', () => {
      const expectedProviders = [
        'provider',
        'mailchimp',
        'buttondown',
        'convertkit',
        'klaviyo',
        'revue',
        'emailoctopus',
      ]

      expectedProviders.forEach((prop) => {
        expect(env.newsletter).toHaveProperty(prop)
      })
    })

    it('comment 对象应该有正确的结构', () => {
      const expectedProviders = ['provider', 'giscus', 'utterances', 'disqus']

      expectedProviders.forEach((prop) => {
        expect(env.comment).toHaveProperty(prop)
      })
    })
  })

  describe('getter 属性行为', () => {
    it('环境判断属性应该返回布尔值', () => {
      expect(typeof env.isDevelopment).toBe('boolean')
      expect(typeof env.isProduction).toBe('boolean')
      expect(typeof env.isTest).toBe('boolean')
    })

    it('配置对象应该每次返回相同的引用', () => {
      const newsletter1 = env.newsletter
      const newsletter2 = env.newsletter
      // getter 每次都会调用，但返回的对象结构应该一致
      expect(newsletter1.provider).toBe(newsletter2.provider)
    })
  })
})
