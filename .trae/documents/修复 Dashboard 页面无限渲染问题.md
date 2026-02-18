
## 问题分析

控制台显示 "Multiple GoTrueClient instances detected" 和 "signal is aborted without reason" 错误。

### 根本原因
`app/dashboard/page.tsx` 中的 `DashboardContent` 组件：
1. 第 120 行：在组件内部直接调用 `const supabase = createBrowserClient()`
2. 第 166 行：`useEffect` 依赖数组包含了 `supabase` 对象

这导致每次渲染都创建新的 supabase 实例，触发无限循环。

### 修复方案

1. **修复 DashboardContent 组件**
   - 使用 `useRef` 缓存 supabase 客户端
   - 从 `useEffect` 依赖数组中移除 supabase
   - 添加 `isMounted` 标志位防止内存泄漏

2. **检查其他可能的问题**
   - 搜索其他使用 `createBrowserClient` 的地方
   - 确保所有地方都使用相同的模式
