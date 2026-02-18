## 修复方案

### 问题根源
项目中存在多个独立的 Supabase 客户端实例，导致会话状态不同步。`profile/page.tsx` 每次渲染都创建新的 Supabase 客户端，无法共享 auth-context 中的会话。

### 修复步骤

#### 1. 修改 `lib/supabase/client.ts` - 改为单例模式
确保 `createBrowserClient()` 返回同一个实例，而不是每次创建新实例。

#### 2. 修改 `app/profile/page.tsx` - 使用全局单例
- 移除组件内部的 `createBrowserClient` 调用
- 改用 `lib/supabase.ts` 导出的全局单例 `supabase`
- 或者使用修改后的 `lib/supabase/client.ts`

#### 3. 优化 auth-context 使用方式
- profile 页面应该优先使用 auth-context 提供的用户状态
- 只在需要额外数据时才查询数据库

### 具体代码修改

#### 修改 1: `lib/supabase/client.ts`
```typescript
// 改为单例模式
let client: ReturnType<typeof createSupabaseClient> | null = null

export const createBrowserClient = () => {
  if (client) return client
  
  client = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
  })
  
  return client
}
```

#### 修改 2: `app/profile/page.tsx`
```typescript
// 移除这行：
// const supabase = createBrowserClient(...)

// 改为使用全局单例：
import { supabase } from "@/lib/supabase"

// 或者使用 auth-context 的用户状态，只在需要时查询额外数据
```

#### 修改 3: 优化 profile 页面逻辑
- 如果 auth-context 已经有用户数据，直接使用
- 只在需要 profile 特有数据（如积分、学习统计）时才查询数据库
- 移除重复的认证检查

### 预期效果
1. 所有页面共享同一个 Supabase 客户端实例
2. 会话状态在页面切换时保持一致
3. 不再出现"请先登录"的错误提示