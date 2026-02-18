## 创建测试脚本

在根目录创建 `test-webhook.js`，用于模拟 Lemon Squeezy 发送 Webhook 请求。

### 脚本功能
1. 生成正确的 HMAC 签名
2. 发送 POST 请求到本地 Webhook 端点
3. 测试 subscription_created 事件

### 使用方法
```bash
node test-webhook.js
```

### 注意事项
- 确保 `secret` 与 `.env.local` 中的 `LEMON_SQUEEZY_WEBHOOK_SECRET` 一致
- 确保 `user_email` 在 Supabase 中存在
- 确保开发服务器正在运行 (npm run dev)