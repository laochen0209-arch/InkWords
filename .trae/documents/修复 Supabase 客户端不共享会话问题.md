## 修复方案

### 问题根源
Profile 页面使用 `@supabase/ssr` 的 `createBrowserClient`，而 Auth Context 使用 `@supabase/supabase-js` 的 `createClient`。这两个客户端使用不同的存储机制，无法共享会话状态。

### 修复步骤

#### 1. 修改 `app/profile/page.tsx` - 使用统一的 Supabase 客户端
将 profile 页面从 `@supabase/ssr` 改为使用 `@/lib/supabase`，与 auth-context 保持一致。

#### 2. 修改 `lib/supabase.ts` - 确保单例模式正确
修复单例模式，确保在生产环境也能正确共享实例。

#### 3. 可选：统一所有页面的 Supabase 客户端
检查其他使用 `@supabase/ssr` 或 `@supabase/supabase-js` 的页面，统一使用 `@/lib/supabase`。

### 具体代码修改

#### 修改 1: `app/profile/page.tsx`
```typescript
// 移除：
// import { createBrowserClient } from '@supabase/ssr'
// const supabase = createBrowserClient(...)

// 改为：
import { supabase } from "@/lib/supabase"
```

#### 修改 2: `lib/supabase.ts`
```typescript
// 确保单例模式在所有环境都生效
const globalForSupabase = globalThis as unknown as {
  supabase: SupabaseClient | undefined
}

export const supabase = globalForSupabase.supabase ?? createClient(supabaseUrl, supabaseAnonKey, {...})

// 在所有环境中都保存到全局变量（不只是非生产环境）
if (typeof window !== 'undefined') {
  globalForSupabase.supabase = supabase
}
```

### 验证步骤
1. 登录后进入学习页面
2. 点击"我的"页面
3. 验证是否正常显示用户数据，而不是"请先登录"
4. 检查控制台是否还有 `[Auth] 当前状态: { isLoading: true, ... }`