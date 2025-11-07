import mongoose from 'mongoose'

let isConnected = false
let connectionPromise: Promise<void> | null = null

export async function connectDB() {
  if (isConnected) {
    return
  }

  // 如果正在连接，返回现有的 promise
  if (connectionPromise) {
    return connectionPromise
  }

  connectionPromise = (async () => {
    try {
      const config = useRuntimeConfig()
      const mongoUri = config.mongodbUri

      if (!mongoUri) {
        throw new Error('MONGODB_URI 环境变量未设置')
      }

      await mongoose.connect(mongoUri)
      isConnected = true
      console.log('✅ MongoDB 连接成功')
    } catch (error) {
      console.error('❌ MongoDB 连接失败:', error)
      isConnected = false
      connectionPromise = null
      throw error
    }
  })()

  return connectionPromise
}

