## 问题分析

从控制台日志可以看到：
1. `[Profile] 请求已被取消，跳过` - profile 页面执行了
2. `[Auth] 当前状态: { isLoading: true, ... }` - auth-context 的渲染日志输出了
3. 但没有 `[Auth] 初始化认证状态...` - 说明 `initializeAuth` 没有被调用

这说明 `AuthProvider` 的 `useEffect` 没有执行！可能的原因：
1. `lib/supabase.ts` 在模块级别创建客户端，可能在服务端渲染时出错
2. 或者 `AuthProvider` 被包裹的方式有问题

## 修复方案

### 1. 修改 `lib/supabase.ts` - 延迟创建客户端
将客户端创建延迟到实际使用时，避免在模块导入时就创建。

### 2. 修改 `lib/contexts/auth-context.tsx` - 添加更多调试和错误处理
- 在 useEffect 外部添加调试日志
- 添加 try-catch 捕获任何可能的错误
- 确保 setIsLoading(false) 在任何情况下都被调用

### 3. 检查 `app/layout.tsx` 的包裹顺序
确保 `AuthProvider` 正确包裹应用。

### 具体代码修改

#### 修改 1: `lib/supabase.ts`
```typescript
// 改为延迟创建模式
let client: SupabaseClient | null = null

export const getSupabase = () => {
  if (client) return client
  
  client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  })
  
  return client
}

// 保持向后兼容
export const supabase = getSupabase()
```

#### 修改 2: `lib/contexts/auth-context.tsx`
```typescript
useEffect(() => {
  console.log('[Auth] useEffect 开始执行')
  
  let isMounted = true
  
  const init = async () => {
    try {
      console.log('[Auth] 初始化开始')
      setIsLoading(true)
      
      const { data, error } = await supabase.auth.getSession()
      console.log('[Auth] getSession 结果:', { data, error })
      
      // ... 后续逻辑
    } catch (err) {
      console.error('[Auth] 初始化异常:', err)
      setIsLoading(false)
    }
  }
  
  init()
  
  return () => {
    isMounted = false
  }
}, [])
```

### 验证步骤
1. 刷新页面
2. 检查控制台是否有 `[Auth] useEffect 开始执行` 日志
3. 检查是否有 `[Auth] 初始化开始` 日志
4. 检查是否有 `[Auth] getSession 结果` 日志