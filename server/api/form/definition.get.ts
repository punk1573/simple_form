import { connectDB } from '~/server/utils/db'
import { FormSchemaModel } from '~/server/models/FormSchema'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()
    
    // 获取最新的激活的表单定义
    const formSchema = await FormSchemaModel.findOne({ isActive: true })
      .sort({ updatedAt: -1 })
    
    // 如果没有表单定义，返回默认字段
    if (!formSchema) {
      return {
        success: true,
        data: {
          version: '1.0.0',
          fields: [
            {
              name: 'name',
              label: '姓名',
              type: 'text',
              required: true,
              placeholder: '请输入您的姓名',
              validation: {
                minLength: 2,
                maxLength: 20
              },
              order: 1
            },
            {
              name: 'age',
              label: '年龄',
              type: 'number',
              required: true,
              placeholder: '请输入您的年龄',
              validation: {
                min: 1,
                max: 150
              },
              order: 2
            },
            {
              name: 'gender',
              label: '性别',
              type: 'select',
              required: true,
              options: ['男', '女', '其他'],
              order: 3
            },
            {
              name: 'phone',
              label: '联系电话',
              type: 'tel',
              required: true,
              placeholder: '请输入手机号码',
              validation: {
                pattern: '^1[3-9]\\d{9}$'
              },
              order: 4
            },
            {
              name: 'idCard',
              label: '身份证号',
              type: 'text',
              required: true,
              placeholder: '请输入18位身份证号码',
              validation: {
                pattern: '^[1-9]\\d{5}(18|19|20)\\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\\d|3[01])\\d{3}[0-9Xx]$'
              },
              order: 5
            },
            {
              name: 'address',
              label: '户籍地址',
              type: 'textarea',
              required: false,
              placeholder: '请输入户籍地址（省市区街道等详细信息）',
              validation: {
                maxLength: 200
              },
              order: 6
            }
          ]
        }
      }
    }
    
    return {
      success: true,
      data: {
        version: formSchema.version,
        fields: formSchema.fields.sort((a, b) => a.order - b.order)
      }
    }
  } catch (error: any) {
    return {
      success: false,
      message: '获取表单定义失败',
      error: error.message
    }
  }
})


