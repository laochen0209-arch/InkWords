## 问题分析

在 `/api/user/stats/update` API 中，消耗练习券的逻辑没有检查用户是否是 VIP：

```typescript
case 'practice':
  // 消耗练习券
  const currentTickets = userData?.practice_tickets ?? 5
  if (currentTickets < value) {
    return NextResponse.json(
      { error: '练习券不足', currentTickets },
      { status: 403 }
    )
  }
  updates.practice_tickets = currentTickets - value
  break
```

## 修复方案

修改 API 端点，在消耗练习券前检查用户是否是 VIP：
1. 查询用户数据时包含 `subscription_status` 字段
2. 如果用户是 VIP（subscription_status 为 'yearly', 'monthly', 'active', 'pro'），则不消耗练习券
3. 只有非 VIP 用户才需要消耗练习券

## 涉及文件
- `app/api/user/stats/update/route.ts` - 添加 VIP 检查逻辑