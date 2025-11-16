import { connectDB } from '~/server/utils/db'
import { verifyCode } from '~/server/utils/sms'
import { z } from 'zod'

const verifySchema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/, '请输入正确的手机号码'),
  code: z.string().length(6, '验证码为6位数字')
})

export default defineEventHandler(async (event) => {
  try {
    await connectDB()
    
    const body = await readBody(event)
    const { phone, code } = verifySchema.parse(body)
    
    // 验证验证码
    const isValid = await verifyCode(phone, code)
    
    if (!isValid) {
      return {
        success: false,
        message: '验证码错误或已过期'
      }
    }
    
    return {
      success: true,
      message: '验证码验证成功'
    }
  } catch (error: any) {
    // Zod 验证错误
    if (error.name === 'ZodError') {
      return {
        success: false,
        message: error.errors[0]?.message || '参数错误'
      }
    }
    
    return {
      success: false,
      message: '验证失败，请稍后重试',
      error: error.message
    }
  }
})

