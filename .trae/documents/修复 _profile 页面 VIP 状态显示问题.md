## 问题分析

1. **subscription/page.tsx** 使用 `localStorage` 获取用户信息，而不是 `useAuth`，导致 VIP 状态判断不一致
2. **VipBanner 组件** 没有接收 `isVip` 状态，始终显示"开通会员"按钮
3. **ProfileHeader 组件** 没有显示 VIP 状态标识

## 修复步骤

### 1. 修改 subscription/page.tsx
- 使用 `useAuth` 替代 `localStorage` 获取用户信息
- 使用 `checkIsVip` 函数正确判断 VIP 状态
- 从 user 对象获取 `subscription_status` 和 `current_period_end`

### 2. 修改 VipBanner 组件
- 添加 `isVip` prop
- 根据 VIP 状态显示不同内容：
  - VIP: 显示"会员有效期至 xxx"或"管理订阅"
  - 非 VIP: 显示"开通墨语会员"

### 3. 修改 ProfileHeader 组件
- 添加 VIP 标识显示（皇冠图标）
- 显示会员到期时间

### 4. 修改 profile/page.tsx
- 传递 `isVip` 状态给 VipBanner

请确认此计划后，我将立即执行修复。