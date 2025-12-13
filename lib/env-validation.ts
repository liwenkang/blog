/**
 * 环境变量验证模块
 * 用于检查必需的环境变量是否正确配置
 */

type NewsletterProvider =
  | 'mailchimp'
  | 'buttondown'
  | 'convertkit'
  | 'klaviyo'
  | 'revue'
  | 'emailoctopus'
type CommentProvider = 'giscus' | 'utterances' | 'disqus'

interface ValidationResult {
  provider: string
  isValid: boolean
  requiredVars: string[]
}

interface EnvValidationStatus {
  newsletter: ValidationResult
  comments: ValidationResult
  timestamp: string
}

/**
 * 验证单个环境变量是否存在且非空
 */
export function validateEnvVar(key: string, context = ''): boolean {
  const value = process.env[key]

  if (!value || value.trim() === '') {
    console.error(`❌ 环境变量缺失: ${key}${context ? ` (${context})` : ''}`)
    return false
  }

  // 检查是否是占位符
  const placeholders = [
    'your_api_key_here',
    'your_new_api_key_here',
    'your_audience_id_here',
    'your_server_here',
    'your_api_server_here',
  ]

  if (placeholders.some((placeholder) => value.toLowerCase().includes(placeholder))) {
    console.error(`⚠️  环境变量 ${key} 包含占位符值，请替换为真实值`)
    return false
  }

  console.log(`✅ 环境变量验证通过: ${key}`)
  return true
}

/**
 * 验证邮件订阅相关的环境变量
 */
export function validateNewsletterEnv(): boolean {
  const provider = (process.env.NEWSLETTER_PROVIDER || 'mailchimp') as NewsletterProvider

  console.log(`🔍 验证邮件订阅环境变量 (${provider})...`)

  const validationMap: Record<NewsletterProvider, string[]> = {
    mailchimp: ['MAILCHIMP_API_KEY', 'MAILCHIMP_API_SERVER', 'MAILCHIMP_AUDIENCE_ID'],
    buttondown: ['BUTTONDOWN_API_KEY'],
    convertkit: ['CONVERTKIT_API_KEY', 'CONVERTKIT_FORM_ID'],
    klaviyo: ['KLAVIYO_API_KEY', 'KLAVIYO_LIST_ID'],
    revue: ['REVUE_API_KEY'],
    emailoctopus: ['EMAILOCTOPUS_API_KEY', 'EMAILOCTOPUS_LIST_ID'],
  }

  const requiredVars = validationMap[provider] || []
  let allValid = true

  for (const varName of requiredVars) {
    if (!validateEnvVar(varName, `${provider} newsletter`)) {
      allValid = false
    }
  }

  if (allValid) {
    console.log(`✅ 邮件订阅环境变量验证通过 (${provider})`)
  } else {
    console.error(`❌ 邮件订阅环境变量验证失败 (${provider})`)
  }

  return allValid
}

/**
 * 验证评论系统相关的环境变量
 */
export function validateCommentEnv(): boolean {
  const provider = (process.env.COMMENT_PROVIDER || 'giscus') as CommentProvider

  console.log(`🔍 验证评论系统环境变量 (${provider})...`)

  const validationMap: Record<CommentProvider, string[]> = {
    giscus: [
      'NEXT_PUBLIC_GISCUS_REPO',
      'NEXT_PUBLIC_GISCUS_REPOSITORY_ID',
      'NEXT_PUBLIC_GISCUS_CATEGORY',
      'NEXT_PUBLIC_GISCUS_CATEGORY_ID',
    ],
    utterances: ['NEXT_PUBLIC_UTTERANCES_REPO'],
    disqus: ['NEXT_PUBLIC_DISQUS_SHORTNAME'],
  }

  const requiredVars = validationMap[provider] || []
  let allValid = true

  for (const varName of requiredVars) {
    if (!validateEnvVar(varName, `${provider} comments`)) {
      allValid = false
    }
  }

  if (allValid) {
    console.log(`✅ 评论系统环境变量验证通过 (${provider})`)
  } else {
    console.error(`❌ 评论系统环境变量验证失败 (${provider})`)
  }

  return allValid
}

/**
 * 验证分析工具相关的环境变量
 */
export function validateAnalyticsEnv(): boolean {
  console.log('🔍 验证分析工具环境变量...')

  const analyticsVars = ['NEXT_PUBLIC_GA_ID', 'NEXT_PUBLIC_SENTRY_DSN']

  // 这些变量是可选的，所以只在配置了时验证格式
  let allValid = true

  for (const varName of analyticsVars) {
    const value = process.env[varName]
    if (value && !validateEnvVar(varName, 'analytics')) {
      allValid = false
    }
  }

  console.log('✅ 分析工具环境变量验证完成')
  return allValid
}

/**
 * 验证所有环境变量（在应用启动时调用）
 */
export function validateAllEnvVars(): boolean {
  console.log('🚀 开始验证环境变量配置...')

  const results = [validateNewsletterEnv(), validateCommentEnv(), validateAnalyticsEnv()]

  const allValid = results.every((result) => result)

  if (allValid) {
    console.log('🎉 所有环境变量验证通过！')
  } else {
    console.error('💥 环境变量验证失败，请检查配置')
  }

  return allValid
}

/**
 * 获取环境变量验证结果（用于 API 响应）
 */
export function getEnvValidationStatus(): EnvValidationStatus {
  const provider = (process.env.NEWSLETTER_PROVIDER || 'mailchimp') as NewsletterProvider
  const commentProvider = (process.env.COMMENT_PROVIDER || 'giscus') as CommentProvider

  return {
    newsletter: {
      provider,
      isValid: validateNewsletterEnv(),
      requiredVars: getRequiredVarsForProvider(provider, 'newsletter'),
    },
    comments: {
      provider: commentProvider,
      isValid: validateCommentEnv(),
      requiredVars: getRequiredVarsForProvider(commentProvider, 'comments'),
    },
    timestamp: new Date().toISOString(),
  }
}

/**
 * 获取指定提供者所需的变量列表
 */
function getRequiredVarsForProvider(provider: string, type: 'newsletter' | 'comments'): string[] {
  const maps = {
    newsletter: {
      mailchimp: ['MAILCHIMP_API_KEY', 'MAILCHIMP_API_SERVER', 'MAILCHIMP_AUDIENCE_ID'],
      buttondown: ['BUTTONDOWN_API_KEY'],
      convertkit: ['CONVERTKIT_API_KEY', 'CONVERTKIT_FORM_ID'],
      klaviyo: ['KLAVIYO_API_KEY', 'KLAVIYO_LIST_ID'],
      revue: ['REVUE_API_KEY'],
      emailoctopus: ['EMAILOCTOPUS_API_KEY', 'EMAILOCTOPUS_LIST_ID'],
    },
    comments: {
      giscus: [
        'NEXT_PUBLIC_GISCUS_REPO',
        'NEXT_PUBLIC_GISCUS_REPOSITORY_ID',
        'NEXT_PUBLIC_GISCUS_CATEGORY',
        'NEXT_PUBLIC_GISCUS_CATEGORY_ID',
      ],
      utterances: ['NEXT_PUBLIC_UTTERANCES_REPO'],
      disqus: ['NEXT_PUBLIC_DISQUS_SHORTNAME'],
    },
  }

  return maps[type]?.[provider as keyof (typeof maps)[typeof type]] || []
}

// 开发环境下自动验证
if (process.env.NODE_ENV === 'development') {
  // 延迟执行，确保所有模块都已加载
  setTimeout(() => {
    console.log('🔧 开发环境：自动验证环境变量...')
    validateAllEnvVars()
  }, 1000)
}
