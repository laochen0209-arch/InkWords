## 实施步骤

### 1. 修改 `app/layout.tsx`
- 添加 `Script` 组件引入 Lemon Squeezy JS
- 放在 children 后面

### 2. 创建 `components/UpgradeButton.tsx`
- 使用 embed 模式的结账链接
- 添加 `lemonsqueezy-button` class

### 3. 创建 `app/api/webhook/lemon/route.ts`
- 处理 subscription_created 事件
- 验证 Webhook 签名
- 更新 Supabase users 表

### 4. 更新 `.env.local`
- 添加 `LEMON_SQUEEZY_WEBHOOK_SECRET`

## 需要的环境变量
```
LEMON_SQUEEZY_WEBHOOK_SECRET=your_webhook_secret_here
```

## 注意事项
- 使用 Service Role Key 绕过 RLS
- 根据邮箱匹配用户
- 更新 is_pro, subscription_id, current_period_end 字段