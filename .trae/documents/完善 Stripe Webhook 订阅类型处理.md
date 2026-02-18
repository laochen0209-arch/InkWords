## 现有代码分析

查看 `app/api/webhook/route.ts` 后发现：

1. `checkout.session.completed` - **已有订阅类型判断逻辑**（第 150-159 行），但使用的是 price.recurring.interval
2. `invoice.payment_succeeded` - **缺少此事件处理**，需要添加
3. `customer.subscription.updated` - **缺少订阅类型更新**，需要补充

## 修复计划

### 1. 优化订阅类型判断逻辑
使用更可靠的方式：直接从 `subscription.items.data[0].price.recurring.interval` 判断
- 'year' → 'yearly'
- 'month' → 'monthly'
- 其他 → 'monthly' (默认)

### 2. 添加 `invoice.payment_succeeded` 事件处理
当用户续费成功时，需要：
- 获取订阅详情
- 判断订阅类型
- 更新到期时间和订阅类型

### 3. 完善 `customer.subscription.updated` 事件
- 添加订阅类型判断
- 在更新会员状态时同时更新 subscription_type

### 4. 处理一次性付款 (lifetime)
如果未来有终身会员，需要处理 `payment_intent.succeeded` 事件