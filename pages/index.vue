<template>
  <div class="container mx-auto px-4 py-12 max-w-2xl">
    <div class="bg-white rounded-2xl shadow-xl p-8">
      <!-- 标题区域 -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          用户信息采集
        </h1>
        <p class="text-gray-600">
          请填写以下信息，我们将妥善保管您的数据
        </p>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p class="mt-4 text-gray-600">正在加载表单...</p>
      </div>

      <!-- 表单区域 -->
      <form v-else-if="formFields.length > 0" @submit.prevent="handleSubmit" class="space-y-6">
        <div
          v-for="field in formFields"
          :key="field.name"
          class="space-y-2"
        >
          <label class="block text-sm font-medium text-gray-700">
            {{ field.label }}
            <span v-if="field.required" class="text-red-500 ml-1">*</span>
          </label>

          <!-- 文本输入 -->
          <input
            v-if="field.type === 'text' || field.type === 'tel'"
            v-model="formData[field.name]"
            :type="field.type"
            :placeholder="field.placeholder"
            :required="field.required"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
            :class="{ 'border-red-500': errors[field.name] }"
          />

          <!-- 数字输入 -->
          <input
            v-else-if="field.type === 'number'"
            v-model.number="formData[field.name]"
            type="number"
            :placeholder="field.placeholder"
            :required="field.required"
            :min="field.validation?.min"
            :max="field.validation?.max"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
            :class="{ 'border-red-500': errors[field.name] }"
          />

          <!-- 下拉选择 -->
          <select
            v-else-if="field.type === 'select'"
            v-model="formData[field.name]"
            :required="field.required"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
            :class="{ 'border-red-500': errors[field.name] }"
          >
            <option value="">请选择</option>
            <option v-for="option in field.options" :key="option" :value="option">
              {{ option }}
            </option>
          </select>

          <!-- 单选框组 -->
          <div v-else-if="field.type === 'radio'" class="flex gap-4">
            <label
              v-for="option in field.options"
              :key="option"
              class="flex items-center cursor-pointer"
            >
              <input
                type="radio"
                :name="field.name"
                :value="option"
                v-model="formData[field.name]"
                :required="field.required"
                class="w-4 h-4 text-blue-600 focus:ring-blue-500"
              />
              <span class="ml-2 text-gray-700">{{ option }}</span>
            </label>
          </div>

          <!-- 文本域 -->
          <textarea
            v-else-if="field.type === 'textarea'"
            v-model="formData[field.name]"
            :placeholder="field.placeholder"
            :required="field.required"
            rows="4"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none"
            :class="{ 'border-red-500': errors[field.name] }"
          ></textarea>

          <!-- 错误提示 -->
          <p v-if="errors[field.name]" class="text-sm text-red-500">
            {{ errors[field.name] }}
          </p>

          <!-- 验证码字段（电话字段后显示） -->
          <div v-if="field.name === 'phone'" class="space-y-2 mt-4">
            <label class="block text-sm font-medium text-gray-700">
              验证码
              <span class="text-red-500 ml-1">*</span>
            </label>
            <div class="flex gap-2">
              <input
                v-model="verificationCode"
                type="text"
                placeholder="请输入6位验证码"
                maxlength="6"
                required
                class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                :class="{ 'border-red-500': errors.verificationCode }"
              />
              <button
                type="button"
                @click="sendCode"
                :disabled="!formData.phone || sendingCode || countdown > 0"
                class="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                <span v-if="countdown > 0">{{ countdown }}秒后重发</span>
                <span v-else-if="sendingCode">发送中...</span>
                <span v-else>发送验证码</span>
              </button>
            </div>
            <p v-if="errors.verificationCode" class="text-sm text-red-500">
              {{ errors.verificationCode }}
            </p>
            <p v-if="codeSent && !errors.verificationCode" class="text-sm text-green-600">
              ✓ 验证码已发送，请查收
            </p>
          </div>
        </div>

        <!-- 提交按钮 -->
        <div class="pt-4 space-y-3">
          <p v-if="submitError" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {{ submitError }}
          </p>
          <button
            type="submit"
            :disabled="submitting"
            class="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="submitting">提交中...</span>
            <span v-else>提交信息</span>
          </button>
        </div>
      </form>

      <!-- 错误状态 -->
      <div v-else-if="error" class="text-center py-12">
        <div class="text-red-500 mb-4">
          <svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p class="text-gray-600">{{ error }}</p>
        <button
          @click="loadFormDefinition"
          class="mt-4 text-blue-600 hover:text-blue-700 underline"
        >
          重试
        </button>
      </div>

      <!-- 成功提示 -->
      <div v-if="submitSuccess" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-2xl p-8 max-w-md mx-4 text-center">
          <div class="text-green-500 mb-4">
            <svg class="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-gray-900 mb-2">提交成功！</h3>
          <p class="text-gray-600 mb-6">感谢您填写信息，数据已安全保存</p>
          <button
            @click="resetForm"
            class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            继续填写
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface FormField {
  name: string
  label: string
  type: 'text' | 'number' | 'tel' | 'select' | 'radio' | 'textarea'
  required?: boolean
  placeholder?: string
  validation?: {
    min?: number
    max?: number
    minLength?: number
    maxLength?: number
    pattern?: string
  }
  options?: string[]
  order?: number
}

interface FormDefinition {
  version: string
  fields: FormField[]
}

const formFields = ref<FormField[]>([])
const formData = ref<Record<string, any>>({})
const errors = ref<Record<string, string>>({})
const loading = ref(true)
const submitting = ref(false)
const submitSuccess = ref(false)
const submitError = ref<string | null>(null)
const error = ref<string | null>(null)

// 验证码相关状态
const verificationCode = ref('')
const sendingCode = ref(false)
const countdown = ref(0)
const codeSent = ref(false)

// 加载表单定义
async function loadFormDefinition() {
  loading.value = true
  error.value = null
  
  try {
    const response = await $fetch<{ success: boolean; data?: FormDefinition; message?: string }>('/api/form/definition')
    
    if (response.success && response.data) {
      formFields.value = response.data.fields
      // 初始化表单数据
      formFields.value.forEach(field => {
        formData.value[field.name] = field.type === 'number' ? null : ''
      })
    } else {
      error.value = response.message || '加载表单失败'
    }
  } catch (err: any) {
    error.value = err.message || '网络错误，请稍后重试'
  } finally {
    loading.value = false
  }
}

// 验证表单
function validateForm(): boolean {
  errors.value = {}
  let isValid = true

  formFields.value.forEach(field => {
    const value = formData.value[field.name]

    // 必填验证
    if (field.required && (value === '' || value === null || value === undefined)) {
      errors.value[field.name] = `${field.label}是必填项`
      isValid = false
      return
    }

    // 如果字段为空且不是必填，跳过其他验证
    if (!value && !field.required) {
      return
    }

    // 手机号验证
    if (field.name === 'phone' && field.validation?.pattern) {
      const pattern = new RegExp(field.validation.pattern)
      if (!pattern.test(value)) {
        errors.value[field.name] = '请输入正确的手机号码'
        isValid = false
      }
    }

    // 身份证号验证
    if (field.name === 'idCard' && field.validation?.pattern) {
      const pattern = new RegExp(field.validation.pattern)
      if (!pattern.test(value)) {
        errors.value[field.name] = '请输入正确的身份证号码'
        isValid = false
      }
    }

    // 数字范围验证
    if (field.type === 'number' && typeof value === 'number') {
      if (field.validation?.min !== undefined && value < field.validation.min) {
        errors.value[field.name] = `最小值不能小于 ${field.validation.min}`
        isValid = false
      }
      if (field.validation?.max !== undefined && value > field.validation.max) {
        errors.value[field.name] = `最大值不能大于 ${field.validation.max}`
        isValid = false
      }
    }

    // 文本长度验证
    if (field.type === 'text' && typeof value === 'string') {
      if (field.validation?.minLength && value.length < field.validation.minLength) {
        errors.value[field.name] = `长度不能少于 ${field.validation.minLength} 个字符`
        isValid = false
      }
      if (field.validation?.maxLength && value.length > field.validation.maxLength) {
        errors.value[field.name] = `长度不能超过 ${field.validation.maxLength} 个字符`
        isValid = false
      }
    }
  })

  return isValid
}

// 发送验证码
async function sendCode() {
  if (!formData.value.phone) {
    errors.value.verificationCode = '请先输入手机号码'
    return
  }

  // 验证手机号格式
  const phonePattern = /^1[3-9]\d{9}$/
  if (!phonePattern.test(formData.value.phone)) {
    errors.value.verificationCode = '请输入正确的手机号码'
    return
  }

  sendingCode.value = true
  errors.value.verificationCode = ''
  codeSent.value = false

  try {
    const response = await $fetch<{ success: boolean; message?: string; code?: string }>('/api/sms/send', {
      method: 'POST',
      body: { phone: formData.value.phone }
    })

    if (response.success) {
      codeSent.value = true
      // 开发环境显示验证码
      if (response.code) {
        console.log('验证码:', response.code)
      }
      // 开始倒计时
      countdown.value = 60
      const timer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) {
          clearInterval(timer)
        }
      }, 1000)
    } else {
      errors.value.verificationCode = response.message || '发送失败，请重试'
    }
  } catch (err: any) {
    errors.value.verificationCode = err.message || '网络错误，请稍后重试'
  } finally {
    sendingCode.value = false
  }
}

// 提交表单
async function handleSubmit() {
  if (!validateForm()) {
    return
  }

  // 验证验证码
  if (!verificationCode.value) {
    errors.value.verificationCode = '请输入验证码'
    return
  }

  if (verificationCode.value.length !== 6) {
    errors.value.verificationCode = '验证码为6位数字'
    return
  }

  submitting.value = true
  errors.value = {}
  submitError.value = null

  try {
    // 先验证验证码
    const verifyResponse = await $fetch<{ success: boolean; message?: string }>('/api/sms/verify', {
      method: 'POST',
      body: {
        phone: formData.value.phone,
        code: verificationCode.value
      }
    })

    if (!verifyResponse.success) {
      errors.value.verificationCode = verifyResponse.message || '验证码错误'
      submitting.value = false
      return
    }

    // 验证码验证成功，提交表单数据
    const response = await $fetch<{ success: boolean; message?: string; errors?: any[] }>('/api/form/submit', {
      method: 'POST',
      body: formData.value
    })

    if (response.success) {
      submitSuccess.value = true
      // 3秒后自动关闭成功提示
      setTimeout(() => {
        resetForm()
      }, 3000)
    } else {
      // 处理服务器返回的验证错误
      if (response.errors) {
        response.errors.forEach((err: any) => {
          errors.value[err.path?.[0] || ''] = err.message || '验证失败'
        })
      } else {
        submitError.value = response.message || '提交失败，请重试'
      }
    }
  } catch (err: any) {
    submitError.value = err.message || '网络错误，请稍后重试'
  } finally {
    submitting.value = false
  }
}

// 重置表单
function resetForm() {
  submitSuccess.value = false
  formData.value = {}
  errors.value = {}
  verificationCode.value = ''
  codeSent.value = false
  countdown.value = 0
  loadFormDefinition()
}

// 页面加载时获取表单定义
onMounted(() => {
  loadFormDefinition()
})
</script>


