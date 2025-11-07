import { connectDB } from '~/server/utils/db'
import { UserData } from '~/server/models/UserData'
import { z } from 'zod'

// 基础数据验证 Schema
const submitSchema = z.object({
  name: z.string().min(2).max(20).optional(),
  age: z.number().min(1).max(150).optional(),
  gender: z.enum(['男', '女', '其他']).optional(),
  phone: z.string().regex(/^1[3-9]\d{9}$/).optional(),
  idCard: z.string().regex(/^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[0-9Xx]$/).optional(),
  extraData: z.record(z.any()).optional()
})

export default defineEventHandler(async (event) => {
  try {
    await connectDB()
    
    const body = await readBody(event)
    
    // 验证数据
    const validatedData = submitSchema.parse(body)
    
    // 获取客户端 IP
    const clientIP = getClientIP(event) || 'unknown'
    
    // 创建用户数据记录
    const userData = new UserData({
      ...validatedData,
      ipAddress: clientIP,
      submittedAt: new Date()
    })
    
    await userData.save()
    
    return {
      success: true,
      message: '数据提交成功',
      data: {
        id: userData._id.toString(),
        submittedAt: userData.submittedAt
      }
    }
  } catch (error: any) {
    // Zod 验证错误
    if (error.name === 'ZodError') {
      return {
        success: false,
        message: '数据验证失败',
        errors: error.errors
      }
    }
    
    // MongoDB 错误
    if (error.name === 'MongoServerError') {
      return {
        success: false,
        message: '数据保存失败',
        error: error.message
      }
    }
    
    return {
      success: false,
      message: '提交失败',
      error: error.message
    }
  }
})


