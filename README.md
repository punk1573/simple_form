# 用户数据采集系统

基于 Nuxt 3 全栈开发的数据采集系统，使用 MongoDB 存储数据。

## 技术栈

- **前端/后端**: Nuxt 3 (Vue 3 + Server API Routes)
- **数据库**: MongoDB (Mongoose)
- **UI**: Tailwind CSS
- **表单验证**: Zod + 自定义验证

## 功能特性
g
- ✅ 动态表单字段定义（后端控制）
- ✅ 数据验证（前端 + 后端双重验证）
- ✅ 现代简约的 UI 设计
- ✅ 响应式布局
- ✅ 数据安全存储

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并配置 MongoDB 连接：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
MONGODB_URI=mongodb://localhost:27017/simple_form
```

### 3. 启动 MongoDB

#### 方式一：本地安装 MongoDB

```bash
# macOS (使用 Homebrew)
brew install mongodb-community
brew services start mongodb-community

# 或使用 Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

#### 方式二：使用 MongoDB Atlas（云端）

1. 访问 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. 创建免费集群
3. 获取连接字符串，更新到 `.env` 文件

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 项目结构

```
.
├── server/
│   ├── api/
│   │   └── form/
│   │       ├── definition.get.ts  # 获取表单定义
│   │       └── submit.post.ts     # 提交数据
│   ├── models/
│   │   ├── UserData.ts            # 用户数据模型
│   │   └── FormSchema.ts          # 表单定义模型
│   └── utils/
│       └── db.ts                  # 数据库连接
├── pages/
│   └── index.vue                  # 主页面（表单）
└── nuxt.config.ts                 # Nuxt 配置

```

## API 接口

### 获取表单定义

```
GET /api/form/definition
```

返回表单字段配置（字段名称、类型、验证规则等）

### 提交数据

```
POST /api/form/submit
Content-Type: application/json

{
  "name": "张三",
  "age": 25,
  "gender": "男",
  "phone": "13800138000",
  "idCard": "110101199001011234"
}
```

## 自定义表单字段

系统支持两种方式定义表单字段：

1. **默认字段**：在 `server/api/form/definition.get.ts` 中定义
2. **数据库存储**：将表单定义保存到 MongoDB（通过 FormSchema 模型）

推荐使用数据库存储方式，这样可以：
- 动态修改表单字段
- 版本化管理
- 无需重启服务

## 数据模型

### UserData（用户数据）

- `name`: 姓名
- `age`: 年龄
- `gender`: 性别（男/女/其他）
- `phone`: 联系电话（已创建索引）
- `idCard`: 身份证号（已创建索引）
- `extraData`: 额外数据（Map 类型）
- `submittedAt`: 提交时间
- `ipAddress`: 客户端 IP
- `createdAt`: 创建时间（自动）
- `updatedAt`: 更新时间（自动）

### FormSchema（表单定义）

- `version`: 版本号
- `fields`: 字段数组
- `isActive`: 是否激活
- `createdAt`: 创建时间
- `updatedAt`: 更新时间

## 部署

### 使用 Vercel 部署

1. 安装 Vercel CLI: `npm i -g vercel`
2. 运行: `vercel`
3. 配置环境变量 `MONGODB_URI`

### 使用 Docker 部署

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
```

## 安全建议

⚠️ **重要**：这是一个演示项目，生产环境请考虑：

1. **数据加密**：对敏感字段（电话、身份证）进行加密存储
2. **访问控制**：添加身份验证和权限控制
3. **速率限制**：防止恶意提交
4. **数据备份**：定期备份数据库
5. **HTTPS**：使用 HTTPS 传输
6. **合规性**：遵守 GDPR、个人信息保护法等法规

## License

MIT


