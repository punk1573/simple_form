// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  runtimeConfig: {
    // 私密配置（服务端可用）
    mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/simple_form',
    smsPushUrl: process.env.SMS_PUSH_URL || '',
    // 公共配置（客户端也可用）
    public: {
      appName: '用户数据采集系统'
    }
  },
  compatibilityDate: '2024-01-01'
})


