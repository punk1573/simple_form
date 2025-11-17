import { VerificationCode } from '~/server/models/VerificationCode'

/**
 * 生成6位数字验证码
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * 发送验证码
 */
export async function sendVerificationCode(phone: string, code: string): Promise<boolean> {
  const config = useRuntimeConfig()
  const smsPushUrl = config.smsPushUrl || process.env.SMS_PUSH_URL

  // 如果没有配置外部服务，则回退到控制台输出（开发环境）
  if (!smsPushUrl) {
    console.warn('[sms] 未配置 smsPushUrl，使用控制台输出模拟发送')
    console.log(`\n📱 [短信验证码 - 模拟发送]`)
    console.log(`   手机号: ${phone}`)
    console.log(`   验证码: ${code}`)
    console.log(`   有效期: 5分钟\n`)
    return true
  }

  const url = new URL(smsPushUrl)
  url.searchParams.set('code', code)
  url.searchParams.set('targets', phone)

  const response = await fetch(url.toString(), {
    method: 'GET'
  })

  if (!response.ok) {
    const text = await response.text()
    console.error('[sms] 发送失败:', text)
    throw new Error('短信发送失败')
  }

  console.log('[sms] 验证码已通过 push.spug.cc 发送')
  return true
}

/**
 * 存储验证码到数据库
 */
export async function saveVerificationCode(phone: string, code: string): Promise<void> {
  const expiresAt = new Date()
  expiresAt.setMinutes(expiresAt.getMinutes() + 5) // 5分钟后过期
  
  // 将之前的验证码标记为已使用（同一手机号只能有一个有效验证码）
  await VerificationCode.updateMany(
    { phone, used: false },
    { $set: { used: true } }
  )
  
  // 创建新的验证码记录
  const verificationCode = new VerificationCode({
    phone,
    code,
    expiresAt,
    used: false
  })
  
  await verificationCode.save()
}

/**
 * 验证验证码
 */
export async function verifyCode(phone: string, code: string): Promise<boolean> {
  const record = await VerificationCode.findOne({
    phone,
    code,
    used: false,
    expiresAt: { $gt: new Date() } // 未过期
  })
  
  if (!record) {
    return false
  }
  
  // 标记为已使用
  record.used = true
  await record.save()
  
  return true
}

/**
 * 检查是否在发送频率限制内（60秒内只能发送一次）
 */
export async function canSendCode(phone: string): Promise<{ canSend: boolean; remainingSeconds?: number }> {
  const recentCode = await VerificationCode.findOne({
    phone,
    createdAt: { $gte: new Date(Date.now() - 60 * 1000) } // 60秒内
  }).sort({ createdAt: -1 })
  
  if (!recentCode) {
    return { canSend: true }
  }
  
  const remainingSeconds = Math.ceil(
    (60 * 1000 - (Date.now() - recentCode.createdAt.getTime())) / 1000
  )
  
  return {
    canSend: false,
    remainingSeconds
  }
}

