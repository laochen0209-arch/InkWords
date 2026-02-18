## 问题分析
当前 `use-dashboard-data.ts` 使用 `supabase.auth.getUser()` 立即检查登录状态，在页面跳转（特别是 Stripe 回调）时，session 可能还没准备好，导致立即报错 '用户未登录'。

## 解决方案
修改为 "监听模式"：
1. 先调用 `getSession()` 尝试获取 session
2. 如果没拿到 session，使用 `onAuthStateChange` 监听状态变化
3. 只有在明确拿到 session 后才去 fetch 数据
4. 在拿到 session 之前，页面一直保持 Loading 状态

## 修改内容
修改 `app/dashboard/hooks/use-dashboard-data.ts`：
- 添加 `isInitialized` 状态标记是否完成初始化检查
- 使用 `getSession()` 替代 `getUser()`
- 如果没 session，监听 `onAuthStateChange`
- 确保在明确拿到 session 前不报错，保持 Loading