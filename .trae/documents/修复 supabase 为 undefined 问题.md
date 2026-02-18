## 问题分析

从错误信息可以看到：
```
[Error] 无法获取未定义或 null 引用的属性 "getSession"
```

这说明 `supabase` 对象是 `undefined` 或 `null`。可能的原因：
1. `createClient` 在服务端渲染时失败了
2. 环境变量 `NEXT_PUBLIC_SUPABASE_URL` 或 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 没有正确加载
3. 模块导出有问题

## 修复方案

### 1. 修改 `lib/supabase.ts` - 添加错误处理和调试
- 添加环境变量检查
- 添加错误处理，确保即使创建失败也不会返回 undefined
- 添加调试日志

### 2. 修改 `lib/contexts/auth-context.tsx` - 添加防御性检查
- 在使用 supabase 之前检查是否为 undefined
- 如果 supabase 未定义，显示错误信息

### 具体代码修改

#### 修改 1: `lib/supabase.ts`
```typescript
// 添加环境变量检查
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[Supabase] 环境变量未设置:', { supabaseUrl, supabaseAnonKey })
}

// 添加 try-catch
function getSupabaseClient(): SupabaseClient {
  try {
    if (globalForSupabase.supabase) {
      return globalForSupabase.supabase
    }
    
    console.log('[Supabase] 创建新客户端...')
    const client = createClient(supabaseUrl, supabaseAnonKey, {...})
    globalForSupabase.supabase = client
    console.log('[Supabase] 客户端创建成功')
    return client
  } catch (error) {
    console.error('[Supabase] 创建客户端失败:', error)
    throw error
  }
}
```

#### 修改 2: `lib/contexts/auth-context.tsx`
```typescript
useEffect(() => {
  // 检查 supabase 是否定义
  if (!supabase) {
    console.error('[Auth] supabase 未定义!')
    setIsLoading(false)
    return
  }
  
  // ... 后续逻辑
}, [])
```

### 验证步骤
1. 刷新页面
2. 检查控制台是否有 `[Supabase] 创建新客户端...` 日志
3. 检查是否有 `[Supabase] 客户端创建成功` 日志
4. 检查是否有 `[Auth] supabase 未定义!` 错误