import { connectDB } from '~/server/utils/db'
import { generateVerificationCode, sendVerificationCode, saveVerificationCode, canSendCode } from '~/server/utils/sms'
import { z } from 'zod'

const sendSchema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/, '请输入正确的手机号码')
})

export default defineEventHandler(async (event) => {
  try {
    await connectDB()
    
    const body = await readBody(event)
    const { phone } = sendSchema.parse(body)
    
    // 检查发送频率限制
    const { canSend, remainingSeconds } = await canSendCode(phone)
    if (!canSend) {
      return {
        success: false,
        message: `发送过于频繁，请 ${remainingSeconds} 秒后再试`
      }
    }
    
    // 生成验证码
    const code = generateVerificationCode()
    
    // 发送验证码（开发环境输出到控制台，生产环境接入短信服务）
    await sendVerificationCode(phone, code)
    
    // 存储验证码到数据库
    await saveVerificationCode(phone, code)
    
    return {
      success: true,
      message: '验证码已发送，请注意查收',
      // 开发环境返回验证码，生产环境应移除
      ...(process.env.NODE_ENV === 'development' && { code })
    }
  } catch (error: any) {
    // Zod 验证错误
    if (error.name === 'ZodError') {
      return {
        success: false,
        message: error.errors[0]?.message || '手机号格式错误'
      }
    }
    
    return {
      success: false,
      message: '发送失败，请稍后重试',
      error: error.message
    }
  }
})

