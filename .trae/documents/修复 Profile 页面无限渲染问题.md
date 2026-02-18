
## 问题分析

Profile 页面控制台不断刷新，显示 "signal is aborted without reason" 错误。

### 根本原因
`ProfileHeader` 组件中的 `useEffect` 依赖数组包含了 `supabase` 对象：
```typescript
const supabase = createBrowserClient()
useEffect(() => {
  // ...
}, [user?.id, supabase])  // ❌ supabase 每次渲染都是新对象
```

每次渲染时 `createBrowserClient()` 都会创建一个新的 supabase 实例，导致 `useEffect` 无限循环执行。

### 修复方案

1. **修复 ProfileHeader 组件**
   - 将 `supabase` 移到 `useEffect` 内部创建，或从依赖数组中移除
   - 使用 `useMemo` 缓存 supabase 客户端
   - 添加清理函数防止内存泄漏

2. **检查 createBrowserClient 实现**
   - 确保它是单例模式，不会重复创建实例

3. **优化依赖数组**
   - 只保留真正需要监听的依赖项
