import mongoose from 'mongoose'

const UserDataSchema = new mongoose.Schema({
  // 基础字段
  name: {
    type: String,
    required: false
  },
  age: {
    type: Number,
    required: false
  },
  gender: {
    type: String,
    enum: ['男', '女', '其他'],
    required: false
  },
  phone: {
    type: String,
    required: false,
    index: true // 为电话创建索引，方便查询
  },
  idCard: {
    type: String,
    required: false,
    index: true // 为身份证号创建索引
  },
  // 可以存储额外的动态字段
  extraData: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  // 元数据
  submittedAt: {
    type: Date,
    default: Date.now
  },
  ipAddress: {
    type: String,
    required: false
  }
}, {
  timestamps: true // 自动添加 createdAt 和 updatedAt
})

export const UserData = mongoose.models.UserData || mongoose.model('UserData', UserDataSchema)


