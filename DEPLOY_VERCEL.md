# Vercel 部署指南

本指南将详细介绍如何将 Nuxt 3 应用部署到 Vercel，包括使用 GitHub 和手动部署两种方式。

## 目录

1. [Vercel 简介](#vercel-简介)
2. [方式一：GitHub 集成部署（推荐）](#方式一github-集成部署推荐)
3. [方式二：手动部署（无需 GitHub）](#方式二手动部署无需-github)
4. [环境变量配置](#环境变量配置)
5. [MongoDB Atlas 配置](#mongodb-atlas-配置)
6. [域名配置](#域名配置)
7. [常见问题](#常见问题)

---

## Vercel 简介

**Vercel** 是一个现代化的前端部署平台，特别适合 Nuxt、Next.js 等框架。

### 优势

- ✅ **免费额度**：个人项目免费使用
- ✅ **自动部署**：GitHub 推送自动部署
- ✅ **全球 CDN**：自动全球加速
- ✅ **HTTPS**：自动配置 SSL 证书
- ✅ **零配置**：Nuxt 3 开箱即用
- ✅ **预览部署**：每个 PR 自动生成预览链接

### 限制

- ⚠️ **无本地数据库**：必须使用 MongoDB Atlas 等云端数据库
- ⚠️ **Serverless 函数**：API 路由有执行时间限制（免费版 10 秒）
- ⚠️ **文件系统只读**：无法写入本地文件

---

## 方式一：GitHub 集成部署（推荐）

### 前置条件

- GitHub 账号
- 代码已推送到 GitHub 仓库

### 步骤 1：准备 GitHub 仓库

```bash
# 1. 初始化 Git（如果还没有）
git init

# 2. 添加所有文件
git add .

# 3. 提交代码
git commit -m "Initial commit"

# 4. 在 GitHub 创建新仓库，然后推送
git remote add origin https://github.com/your-username/simple-form.git
git branch -M main
git push -u origin main
```

### 步骤 2：连接 Vercel

1. **访问 Vercel**
   - 打开 [vercel.com](https://vercel.com)
   - 使用 GitHub 账号登录

2. **导入项目**
   - 点击 "Add New..." → "Project"
   - 选择你的 GitHub 仓库 `simple-form`
   - 点击 "Import"

3. **配置项目**
   - **Framework Preset**: Nuxt.js（自动检测）
   - **Root Directory**: `./`（默认）
   - **Build Command**: `npm run build`（自动）
   - **Output Directory**: `.output`（自动）
   - **Install Command**: `npm install`（自动）

4. **环境变量**（先跳过，稍后配置）

5. **部署**
   - 点击 "Deploy"
   - 等待构建完成（约 2-3 分钟）

### 步骤 3：配置环境变量

部署完成后，需要配置环境变量：

1. **进入项目设置**
   - 在 Vercel 项目页面，点击 "Settings"
   - 选择 "Environment Variables"

2. **添加环境变量**

   | 变量名 | 值 | 说明 |
   |--------|-----|------|
   | `MONGODB_URI` | `mongodb+srv://...` | MongoDB Atlas 连接字符串 |
   | `SMS_PUSH_URL` | `https://push.spug.cc/send/Token` | 短信推送服务地址 |
   | `NODE_ENV` | `production` | 生产环境标识 |

3. **应用到所有环境**
   - 勾选 "Production"、"Preview"、"Development"
   - 点击 "Save"

4. **重新部署**
   - 在 "Deployments" 页面
   - 点击最新部署右侧的 "..." → "Redeploy"

### 步骤 4：验证部署

- 访问 Vercel 提供的域名（如 `simple-form.vercel.app`）
- 测试表单提交功能

### 自动部署

配置完成后，每次推送到 GitHub 的 `main` 分支，Vercel 会自动：
1. 检测代码变更
2. 运行构建
3. 部署到生产环境
4. 发送通知（可选）

---

## 方式二：手动部署（无需 GitHub）

如果你不想使用 GitHub，可以使用 Vercel CLI 手动部署。

### 步骤 1：安装 Vercel CLI

```bash
# 全局安装
npm install -g vercel

# 或使用 npx（推荐，无需全局安装）
npx vercel
```

### 步骤 2：登录 Vercel

```bash
vercel login
```

这会打开浏览器，使用 GitHub、GitLab 或 Bitbucket 账号登录。

### 步骤 3：部署项目

```bash
# 进入项目目录
cd /path/to/simple-form

# 首次部署（会提示配置）
vercel

# 部署到生产环境
vercel --prod
```

**首次部署会询问：**

```
? Set up and deploy "~/simple-form"? [Y/n] y
? Which scope do you want to deploy to? [选择你的账号]
? Link to existing project? [y/N] n
? What's your project's name? simple-form
? In which directory is your code located? ./
```

### 步骤 4：配置环境变量

使用 CLI 设置环境变量：

```bash
# 设置 MongoDB URI
vercel env add MONGODB_URI production
# 粘贴你的 MongoDB Atlas 连接字符串

# 设置短信推送地址
vercel env add SMS_PUSH_URL production
# 粘贴: https://push.spug.cc/send/你的Token

# 设置环境
vercel env add NODE_ENV production
# 输入: production

# 查看所有环境变量
vercel env ls
```

### 步骤 5：重新部署

```bash
# 重新部署以应用环境变量
vercel --prod
```

### 更新部署

```bash
# 修改代码后，重新部署
vercel --prod

# 或使用别名
vercel -p
```

---

## 环境变量配置

### 必需的环境变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `MONGODB_URI` | MongoDB Atlas 连接字符串 | `mongodb+srv://user:pass@cluster.mongodb.net/dbname` |
| `SMS_PUSH_URL` | 短信推送服务地址 | `https://push.spug.cc/send/E3w5LmlZe6rxYea4` |
| `NODE_ENV` | 环境标识 | `production` |

### 在 Vercel 中配置

#### 方法 1：Web 界面

1. 项目 → Settings → Environment Variables
2. 添加变量
3. 选择环境（Production/Preview/Development）
4. 保存并重新部署

#### 方法 2：CLI

```bash
# 添加变量
vercel env add VARIABLE_NAME production

# 查看变量
vercel env ls

# 删除变量
vercel env rm VARIABLE_NAME production
```

#### 方法 3：`.env` 文件（仅本地开发）

Vercel 不支持直接上传 `.env` 文件，但可以在本地使用：

```bash
# 本地开发
vercel dev
```

---

## MongoDB Atlas 配置

由于 Vercel 是 Serverless 环境，无法运行本地 MongoDB，必须使用 MongoDB Atlas。

### 步骤 1：创建 MongoDB Atlas 账号

1. 访问 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. 注册/登录账号
3. 创建免费集群（M0，512MB，免费）

### 步骤 2：配置网络访问

1. **Security** → **Network Access**
2. 点击 "Add IP Address"
3. 选择 "Allow Access from Anywhere"（`0.0.0.0/0`）
   - 或添加 Vercel 的 IP 范围（更安全）

### 步骤 3：创建数据库用户

1. **Security** → **Database Access**
2. 点击 "Add New Database User"
3. 设置用户名和密码
4. 选择权限：`Read and write to any database`

### 步骤 4：获取连接字符串

1. **Deployments** → **Database** → **Connect**
2. 选择 "Connect your application"
3. 复制连接字符串，格式：
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/simple_form?retryWrites=true&w=majority
   ```
4. 替换 `<username>` 和 `<password>` 为实际值

### 步骤 5：在 Vercel 中配置

将连接字符串添加到 Vercel 环境变量 `MONGODB_URI`

---

## 域名配置

### 使用 Vercel 免费域名

部署后自动获得：
- `your-project.vercel.app`
- 自动 HTTPS

### 绑定自定义域名

1. **项目设置** → **Domains**
2. 输入你的域名（如 `form.example.com`）
3. 按照提示配置 DNS：
   - 添加 CNAME 记录：`form` → `cname.vercel-dns.com`
   - 或 A 记录：指向 Vercel IP
4. 等待 DNS 生效（通常几分钟）
5. Vercel 自动配置 SSL 证书

---

## 项目配置文件

### `vercel.json`（可选）

如果需要自定义配置，创建 `vercel.json`：

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".output",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nuxtjs",
  "regions": ["hkg1"],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### 忽略文件

确保 `.vercelignore` 或 `.gitignore` 包含：

```
node_modules
.env
.env.local
.output
.nuxt
```

---

## 常见问题

### 1. 构建失败 - 模块未找到

**问题**: `Could not load @nuxtjs/tailwindcss. Is it installed?`

**原因**: Nuxt 模块在 `devDependencies` 中，但 Vercel 构建时需要它们

**解决**:
1. 将构建时需要的模块移到 `dependencies`：
   ```json
   {
     "dependencies": {
       "@nuxtjs/tailwindcss": "^6.12.0",
       // ... 其他依赖
     }
   }
   ```
2. 提交并推送代码：
   ```bash
   git add package.json
   git commit -m "Fix: Move tailwindcss to dependencies"
   git push
   ```
3. Vercel 会自动重新部署

**其他构建错误**:
```bash
# 本地测试构建
npm run build

# 检查错误日志
# 在 Vercel 部署页面查看构建日志
```

### 2. MongoDB 连接失败

**问题**: 无法连接到 MongoDB Atlas

**解决**:
- 检查 `MONGODB_URI` 环境变量是否正确
- 确认 MongoDB Atlas 网络访问已配置（允许所有 IP 或 Vercel IP）
- 检查数据库用户名和密码
- 查看 Vercel 函数日志

### 3. 环境变量未生效

**问题**: 部署后环境变量不生效

**解决**:
- 确认环境变量已保存
- 重新部署项目（环境变量变更需要重新部署）
- 检查变量名拼写是否正确

### 4. API 路由超时

**问题**: API 请求超时（免费版 10 秒限制）

**解决**:
- 优化数据库查询
- 使用 Vercel Pro（60 秒限制）
- 考虑将耗时操作移到外部服务

### 5. 文件上传限制

**问题**: 无法上传大文件

**解决**:
- Vercel 免费版限制 4.5MB
- 使用外部存储（如 AWS S3、Cloudinary）
- 升级到 Pro 版本

### 6. 冷启动慢

**问题**: 首次请求响应慢

**解决**:
- 这是 Serverless 函数的正常现象
- 使用 Vercel Pro 的 Edge Functions
- 配置函数预热（Pro 功能）

---

## 部署检查清单

- [ ] 代码已推送到 GitHub（或准备好手动部署）
- [ ] MongoDB Atlas 集群已创建
- [ ] MongoDB 网络访问已配置
- [ ] 数据库用户已创建
- [ ] 连接字符串已获取
- [ ] Vercel 账号已注册
- [ ] 项目已导入/部署到 Vercel
- [ ] 环境变量已配置（MONGODB_URI, SMS_PUSH_URL, NODE_ENV）
- [ ] 项目已重新部署（应用环境变量）
- [ ] 域名已配置（可选）
- [ ] 功能测试通过

---

## 快速命令参考

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录
vercel login

# 部署（首次）
vercel

# 部署到生产
vercel --prod

# 查看部署
vercel ls

# 查看日志
vercel logs

# 本地开发（使用 Vercel 环境）
vercel dev

# 查看环境变量
vercel env ls

# 添加环境变量
vercel env add VARIABLE_NAME production

# 删除环境变量
vercel env rm VARIABLE_NAME production
```

---

## 总结

### GitHub 集成方式（推荐）

✅ **优点**:
- 自动部署
- 预览环境
- 版本控制集成
- 团队协作友好

### 手动部署方式

✅ **优点**:
- 无需 GitHub
- 更灵活
- 适合私有项目

### 两种方式都需要

- MongoDB Atlas（云端数据库）
- 环境变量配置
- Vercel 账号

---

## 下一步

部署完成后：

1. **测试功能**：提交表单，验证数据保存
2. **监控日志**：在 Vercel 控制台查看函数日志
3. **性能优化**：监控响应时间，优化慢查询
4. **设置告警**：配置错误通知（Pro 功能）

如有问题，查看 Vercel 文档或联系支持。

