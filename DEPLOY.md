# 云服务器部署指南

本指南将帮助你将 Nuxt 3 应用部署到云服务器（如阿里云、腾讯云、AWS 等）。

## 目录

1. [服务器环境准备](#服务器环境准备)
2. [代码部署](#代码部署)
3. [环境变量配置](#环境变量配置)
4. [MongoDB 配置](#mongodb-配置)
5. [进程管理（PM2）](#进程管理pm2)
6. [Nginx 反向代理](#nginx-反向代理)
7. [域名和 SSL 配置](#域名和-ssl-配置)
8. [监控和维护](#监控和维护)

---

## 服务器环境准备

### 1. 系统要求

- **操作系统**: Ubuntu 20.04+ / CentOS 7+ / Debian 10+
- **Node.js**: 20.x 或更高版本
- **内存**: 至少 1GB（推荐 2GB+）
- **磁盘**: 至少 10GB 可用空间

### 2. 安装 Node.js

```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs

# 验证安装
node -v
npm -v
```

### 3. 安装 PM2（进程管理器）

```bash
sudo npm install -g pm2
```

### 4. 安装 Nginx

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y nginx

# CentOS/RHEL
sudo yum install -y nginx

# 启动 Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

## 代码部署

### 方式一：Git 部署（推荐）

```bash
# 1. 创建应用目录
sudo mkdir -p /var/www/simple-form
sudo chown $USER:$USER /var/www/simple-form

# 2. 克隆代码
cd /var/www/simple-form
git clone <your-repo-url> .

# 3. 安装依赖
npm install --production

# 4. 构建应用
npm run build
```

### 方式二：手动上传

```bash
# 1. 在本地构建
npm run build

# 2. 使用 scp 上传文件
scp -r .output node_modules package.json nuxt.config.ts server pages app.vue <user>@<server-ip>:/var/www/simple-form/

# 3. 在服务器上安装生产依赖
cd /var/www/simple-form
npm install --production
```

---

## 环境变量配置

### 1. 创建 `.env` 文件

```bash
cd /var/www/simple-form
nano .env
```

### 2. 配置环境变量

```env
# MongoDB 连接（本地或 Atlas）
MONGODB_URI=mongodb://localhost:27017/simple_form
# 或使用 MongoDB Atlas
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/simple_form

# 短信推送服务（push.spug.cc）
SMS_PUSH_URL=https://push.spug.cc/send/你的Token

# Node 环境
NODE_ENV=production

# 应用端口（可选，默认 3000）
PORT=3000
```

### 3. 设置文件权限

```bash
chmod 600 .env
```

---

## MongoDB 配置

### 方式一：本地 MongoDB

```bash
# Ubuntu/Debian
sudo apt-get install -y mongodb

# CentOS/RHEL
sudo yum install -y mongodb-server

# 启动 MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# 创建数据库和用户（可选）
mongosh
use simple_form
db.createUser({
  user: "appuser",
  pwd: "your-password",
  roles: [{ role: "readWrite", db: "simple_form" }]
})
```

### 方式二：MongoDB Atlas（云端，推荐）

1. 访问 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. 创建免费集群
3. 获取连接字符串
4. 更新 `.env` 中的 `MONGODB_URI`

---

## 进程管理（PM2）

### 1. 创建 PM2 配置文件

```bash
cd /var/www/simple-form
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'simple-form',
    script: '.output/server/index.mjs',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
}
```

### 2. 启动应用

```bash
# 启动
pm2 start ecosystem.config.js

# 查看状态
pm2 status

# 查看日志
pm2 logs simple-form

# 保存 PM2 配置（开机自启）
pm2 save
pm2 startup
```

### 3. PM2 常用命令

```bash
# 重启应用
pm2 restart simple-form

# 停止应用
pm2 stop simple-form

# 删除应用
pm2 delete simple-form

# 查看实时日志
pm2 logs simple-form --lines 50

# 监控
pm2 monit
```

---

## Nginx 反向代理

### 1. 创建 Nginx 配置

```bash
sudo nano /etc/nginx/sites-available/simple-form
```

```nginx
server {
    listen 80;
    server_name your-domain.com;  # 替换为你的域名或 IP

    # 日志
    access_log /var/log/nginx/simple-form-access.log;
    error_log /var/log/nginx/simple-form-error.log;

    # 客户端最大上传大小
    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

### 2. 启用配置

```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/simple-form /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重载 Nginx
sudo systemctl reload nginx
```

---

## 域名和 SSL 配置

### 1. 使用 Let's Encrypt 免费 SSL

```bash
# 安装 Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# 获取 SSL 证书（替换为你的域名）
sudo certbot --nginx -d your-domain.com

# 自动续期测试
sudo certbot renew --dry-run
```

### 2. 更新 Nginx 配置（SSL）

Certbot 会自动更新 Nginx 配置，添加 SSL 支持。

### 3. 防火墙配置

```bash
# Ubuntu (UFW)
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# CentOS (firewalld)
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

---

## 监控和维护

### 1. 日志管理

```bash
# 应用日志（PM2）
pm2 logs simple-form

# Nginx 日志
sudo tail -f /var/log/nginx/simple-form-access.log
sudo tail -f /var/log/nginx/simple-form-error.log

# 系统日志
sudo journalctl -u nginx -f
```

### 2. 性能监控

```bash
# PM2 监控
pm2 monit

# 系统资源
htop
# 或
top
```

### 3. 备份策略

```bash
# MongoDB 备份脚本
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/mongodb"
mkdir -p $BACKUP_DIR

# 本地 MongoDB 备份
mongodump --out $BACKUP_DIR/$DATE

# 或 MongoDB Atlas 备份（通过 Atlas 控制台）
```

### 4. 更新部署

```bash
# 1. 拉取最新代码
cd /var/www/simple-form
git pull

# 2. 安装新依赖
npm install --production

# 3. 重新构建
npm run build

# 4. 重启应用
pm2 restart simple-form

# 5. 检查状态
pm2 status
pm2 logs simple-form --lines 20
```

---

## 快速部署脚本

创建一键部署脚本 `deploy.sh`：

```bash
#!/bin/bash
set -e

echo "🚀 开始部署..."

# 1. 拉取代码
echo "📥 拉取最新代码..."
git pull

# 2. 安装依赖
echo "📦 安装依赖..."
npm install --production

# 3. 构建应用
echo "🔨 构建应用..."
npm run build

# 4. 重启 PM2
echo "🔄 重启应用..."
pm2 restart simple-form

# 5. 检查状态
echo "✅ 部署完成！"
pm2 status
pm2 logs simple-form --lines 10

echo "🎉 部署成功！"
```

使用：

```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 常见问题

### 1. 应用无法启动

```bash
# 检查端口是否被占用
sudo lsof -i :3000

# 检查环境变量
pm2 env simple-form

# 查看详细错误
pm2 logs simple-form --err
```

### 2. MongoDB 连接失败

```bash
# 检查 MongoDB 状态
sudo systemctl status mongod

# 检查连接字符串
cat .env | grep MONGODB_URI

# 测试连接
mongosh "mongodb://localhost:27017/simple_form"
```

### 3. Nginx 502 错误

```bash
# 检查应用是否运行
pm2 status

# 检查端口
netstat -tlnp | grep 3000

# 检查 Nginx 配置
sudo nginx -t
```

### 4. 内存不足

```bash
# 查看内存使用
free -h

# 优化 PM2 配置，限制内存
# 在 ecosystem.config.js 中设置 max_memory_restart: '500M'
```

---

## 安全建议

1. **防火墙**: 只开放必要端口（22, 80, 443）
2. **SSH**: 禁用 root 登录，使用密钥认证
3. **环境变量**: 不要将 `.env` 提交到 Git
4. **定期更新**: 保持系统和依赖包更新
5. **备份**: 定期备份数据库和代码
6. **监控**: 设置日志监控和告警

---

## 完成

部署完成后，访问你的域名或服务器 IP，应该能看到应用正常运行！

如有问题，请查看日志文件或联系技术支持。

