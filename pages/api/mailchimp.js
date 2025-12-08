import mailchimp from '@mailchimp/mailchimp_marketing'
import { validateEnvVar } from '@/lib/env-validation'

// 验证必需的环境变量
const requiredVars = ['MAILCHIMP_API_KEY', 'MAILCHIMP_API_SERVER', 'MAILCHIMP_AUDIENCE_ID']
const missingVars = requiredVars.filter((key) => !validateEnvVar(key, 'Mailchimp API'))

if (missingVars.length > 0 && process.env.NODE_ENV !== 'production') {
  console.error('Mailchimp API: 缺少必需的环境变量:', missingVars)
}

mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_API_SERVER, // E.g. us1
})

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req, res) => {
  const { email } = req.body

  if (!email) {
    return res.status(400).json({ error: 'Email is required' })
  }

  // 运行时环境变量验证
  if (missingVars.length > 0) {
    const errorMsg = `Server configuration error. Missing: ${missingVars.join(', ')}`
    console.error('Mailchimp API:', errorMsg)

    if (process.env.NODE_ENV === 'development') {
      return res.status(500).json({
        error: errorMsg,
        debug: {
          missingVars,
          envStatus: {
            hasApiKey: !!process.env.MAILCHIMP_API_KEY,
            hasServer: !!process.env.MAILCHIMP_API_SERVER,
            hasAudienceId: !!process.env.MAILCHIMP_AUDIENCE_ID,
          },
        },
      })
    } else {
      return res.status(500).json({ error: 'Server configuration error' })
    }
  }

  try {
    const result = await mailchimp.lists.addListMember(process.env.MAILCHIMP_AUDIENCE_ID, {
      email_address: email,
      status: 'subscribed',
    })

    console.log('✅ Mailchimp subscription successful:', {
      email,
      id: result.id,
      audienceId: process.env.MAILCHIMP_AUDIENCE_ID?.slice(0, 4) + '***', // 部分显示用于调试
    })

    return res.status(201).json({ error: '' })
  } catch (error) {
    console.error('❌ Mailchimp API error:', {
      message: error.message,
      status: error.status,
      email: email.slice(0, 3) + '***', // 部分显示邮箱用于调试
    })

    // 处理常见错误
    if (error.message?.includes('already a member')) {
      return res.status(409).json({ error: 'You are already subscribed!' })
    }

    if (error.message?.includes('Invalid Resource')) {
      return res.status(400).json({ error: 'Invalid email address' })
    }

    return res.status(500).json({ error: error.message || error.toString() })
  }
}
