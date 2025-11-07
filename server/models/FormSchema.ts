import mongoose from 'mongoose'

// 表单字段定义 Schema
const FormFieldSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'number', 'tel', 'select', 'radio', 'textarea'],
    required: true
  },
  required: {
    type: Boolean,
    default: false
  },
  placeholder: {
    type: String,
    default: ''
  },
  validation: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  options: {
    type: [String], // 用于 select 和 radio
    default: []
  },
  order: {
    type: Number,
    default: 0
  }
})

const FormSchema = new mongoose.Schema({
  version: {
    type: String,
    default: '1.0.0'
  },
  fields: [FormFieldSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

export const FormSchemaModel = mongoose.models.FormSchema || mongoose.model('FormSchema', FormSchema)


