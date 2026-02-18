## Stripe 支付集成实现计划

### 1. 安装依赖
需要安装以下包：
```bash
npm install stripe
```

### 2. 环境变量配置 (.env)
需要添加以下环境变量：
```env
# Stripe 配置
STRIPE_SECRET_KEY=sk_test_...  # Stripe 密钥
STRIPE_WEBHOOK_SECRET=whsec_...  # Webhook 签名密钥
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...  # 前端用的公钥

# Stripe Price IDs (需要在 Stripe Dashboard 中创建)
STRIPE_PRICE_MONTHLY=price_...  # 月付价格ID
STRIPE_PRICE_YEARLY=price_...   # 年付价格ID
```

### 3. 数据库更新 (Prisma Schema)
需要在 `User` 模型中添加会员相关字段：
```prisma
model User {
  // ... 现有字段
  isPro            Boolean   @default(false) @map("is_pro")
  currentPeriodEnd DateTime? @map("current_period_end")
  stripeCustomerId String?   @map("stripe_customer_id")
  stripeSubscriptionId String? @map("stripe_subscription_id")
}
```

### 4. 创建文件

#### 4.1 创建 Checkout API (`app/api/checkout/route.ts`)
- 接收 priceId 和 userId
- 初始化 Stripe 客户端
- 创建订阅会话
- 返回 checkout URL

#### 4.2 创建 Webhook API (`app/api/webhook/route.ts`)
- 验证 Stripe 签名
- 处理 `checkout.session.completed` 事件
- 处理 `invoice.payment_failed` 事件
- 更新用户会员状态

### 5. 执行步骤
1. 安装 stripe 依赖
2. 更新 .env 添加 Stripe 配置
3. 更新 Prisma Schema 添加会员字段
4. 运行数据库迁移
5. 创建 checkout API
6. 创建 webhook API

请确认此计划后，我将开始实施具体的代码实现。