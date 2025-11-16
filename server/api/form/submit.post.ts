import { connectDB } from '~/server/utils/db'
import { UserData } from '~/server/models/UserData'
import { z } from 'zod'
import { getRequestIP } from 'h3'

// 基础数据验证 Schema
const submitSchema = z.object({
  name: z.string().min(2).max(20).optional(),
  age: z.number().min(1).max(150).optional(),
  gender: z.enum(['男', '女', '其他']).optional(),
  phone: z.string().regex(/^1[3-9]\d{9}$/).optional(),
  idCard: z.string().regex(/^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[0-9Xx]$/).optional(),
  address: z.string().max(200).optional(),
  extraData: z.record(z.any()).optional()
})

export default defineEventHandler(async (event) => {
  try {
    await connectDB()
    
    const body = await readBody(event)
    
    // 验证数据
    const validatedData = submitSchema.parse(body)
    
    // 获取客户端 IP
    const clientIP = getRequestIP(event) || 'unknown'
    console.log('[submit] validated data', { ...validatedData, ipAddress: clientIP })
    
    let userData
    let isUpdate = false
    
    // 如果提供了身份证号，使用 upsert（存在则更新，不存在则创建）
    if (validatedData.idCard) {
      // 检查是否已存在相同身份证号的记录
      const existingRecord = await UserData.findOne({ idCard: validatedData.idCard })
      isUpdate = !!existingRecord
      
      // 使用 findOneAndUpdate 实现 upsert（存在则更新，不存在则创建）
      userData = await UserData.findOneAndUpdate(
        { idCard: validatedData.idCard },
        {
          $set: {
            ...validatedData,
            ipAddress: clientIP,
            submittedAt: new Date()
          }
        },
        {
          new: true,        // 返回更新后的文档
          upsert: true,     // 如果不存在则创建
          setDefaultsOnInsert: true  // 创建时设置默认值
        }
      )
      
      if (isUpdate) {
        console.log('[submit] ✅ 更新已存在的记录（身份证号相同）', {
          id: userData._id.toString(),
          idCard: validatedData.idCard
        })
      } else {
        console.log('[submit] ✅ 创建新记录', {
          id: userData._id.toString(),
          idCard: validatedData.idCard
        })
      }
    } else {
      // 没有身份证号，创建新记录
      userData = new UserData({
        ...validatedData,
        ipAddress: clientIP,
        submittedAt: new Date()
      })
      await userData.save()
      console.log('[submit] ✅ 创建新记录（无身份证号）', userData._id.toString())
    }
    
    return {
      success: true,
      message: isUpdate ? '数据更新成功（身份证号相同，已覆盖旧记录）' : '数据提交成功',
      data: {
        id: userData._id.toString(),
        submittedAt: userData.submittedAt,
        isUpdate
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


