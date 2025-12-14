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

# 4. 创建日志目录
mkdir -p logs

# 5. 重启 PM2
echo "🔄 重启应用..."
pm2 restart simple-form || pm2 start ecosystem.config.js

# 6. 检查状态
echo "✅ 部署完成！"
pm2 status
pm2 logs simple-form --lines 10

echo "🎉 部署成功！"

