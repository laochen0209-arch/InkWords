## 问题分析

1. **Supabase Client 多实例问题**：
   - `lib/supabase.ts` 直接导出 `createClient` 创建的实例
   - 每次导入都会创建新实例，导致 "Multiple GoTrueClient instances detected" 警告

2. **数据获取串行化**：
   - `fetchUserStats` 函数中查询是串行的
   - 可以并行化以减少加载时间

3. **缺少骨架屏**：
   - 只有简单的 loading spinner

## 修复方案

### 1. 修复 Supabase Client 单例模式

**修改 `lib/supabase.ts`**：
```typescript
// 使用全局变量确保单例
const globalForSupabase = globalThis as unknown as {
  supabase: SupabaseClient | undefined
}

export const supabase = globalForSupabase.supabase ?? createClient(supabaseUrl, supabaseAnonKey)

if (process.env.NODE_ENV !== 'production') {
  globalForSupabase.supabase = supabase
}
```

### 2. 优化数据获取逻辑（并行化）

**修改 `app/practice/PracticeContent.tsx`**：
- 使用 `Promise.all` 并行获取 session 和本地数据
- 并行查询 practice_records、user_progress、users
- 减少串行等待时间

### 3. 添加骨架屏

**修改 `app/practice/page.tsx`**：
- 创建 PracticeSkeleton 组件
- 显示页面结构占位符

请确认后执行修改。