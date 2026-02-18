## 问题分析

当前流程：
1. 支付成功 → Stripe 跳转 `/dashboard?success=true`
2. dashboard 页面激活 VIP → 再跳转到 `/profile`

问题：
- 中间多了一步 dashboard 跳转
- 用户希望直接到"我的"页面

## 修复方案

### 方案1（推荐）：修改 success_url 直接到 profile
修改 `app/api/checkout/route.ts`：
```typescript
success_url: `${baseUrl}/profile?success=true`,
```

然后在 `app/profile/page.tsx` 添加：
1. 检测 `success=true` 参数
2. 调用 activate-vip API
3. 显示 VIP 开通成功提示
4. 刷新用户数据显示最新 VIP 状态

### 具体修改

**文件1**: `app/api/checkout/route.ts`
- 修改 success_url 为 `/profile?success=true`

**文件2**: `app/profile/page.tsx`
- 添加支付成功检测逻辑
- 调用 API 激活 VIP
- 显示 VIP 开通成功提示
- 刷新用户数据显示 VIP 到期时间

请确认后我将执行修复。