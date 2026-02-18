## Stripe Customer Portal 管理订阅实现计划

### 1. 数据库字段检查 ✅
已在 `prisma/schema.prisma` 的 User 模型中确认有以下字段：
- `stripeCustomerId` - Stripe 客户ID
- `stripeSubscriptionId` - Stripe 订阅ID
- `isPro` - 是否为会员
- `currentPeriodEnd` - 会员到期时间

### 2. 创建 Portal API (app/api/portal/route.ts)
- POST 接口
- 从请求头获取用户邮箱
- 查询数据库获取用户的 stripe_customer_id
- 调用 stripe.billingPortal.sessions.create
- return_url: /dashboard
- 返回生成的 portal URL

### 3. 更新 User Me API (app/api/user/me/route.ts)
- 在返回的用户信息中添加 `isPro` 字段
- 前端需要此字段判断用户是否为会员

### 4. 更新定价页面 (app/pricing/page.tsx)
- 添加用户状态获取逻辑
- 如果 `isPro === true`：
  - 隐藏购买卡片
  - 显示会员状态卡片（"您已是尊贵的会员"）
  - 显示"管理订阅 / 取消订阅"按钮
  - 点击调用 /api/portal 并跳转
- 如果 `isPro === false`：
  - 显示现有的购买卡片

### 5. 更新 Webhook (app/api/webhook/route.ts)
- 在 checkout.session.completed 中确保保存 session.customer 到 users 表

请确认此计划后，我将开始实施具体的代码实现。