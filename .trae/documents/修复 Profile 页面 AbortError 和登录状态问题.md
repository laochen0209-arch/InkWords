## 修复方案

### 问题 1: Profile 页面缺少 AbortController
**文件**: [app/profile/page.tsx](file:///g:/trea/jiaoben/inkwords/app/profile/page.tsx)

**修改内容**:
1. 在 `fetchUserData` 函数中添加 AbortSignal 参数
2. 在 supabase 查询中传递 signal
3. 在 useEffect 中添加 AbortController 和清理函数
4. 添加 AbortError 的错误处理

### 问题 2: 认证状态与页面状态同步
**文件**: [app/profile/page.tsx](file:///g:/trea/jiaoben/inkwords/app/profile/page.tsx)

**修改内容**:
1. 监听全局 auth 状态变化，当 auth 加载完成后再获取数据
2. 添加重试机制，当请求失败时自动重试
3. 优化加载状态显示，避免闪烁

### 问题 3: 错误处理优化
**文件**: [app/profile/page.tsx](file:///g:/trea/jiaoben/inkwords/app/profile/page.tsx)

**修改内容**:
1. 区分 AbortError 和其他错误
2. 添加更详细的错误日志
3. 避免在组件卸载后更新状态

### 具体代码修改

#### 修改 1: 添加 AbortController 和清理
```typescript
// 在 useEffect 中
useEffect(() => {
  const controller = new AbortController()
  
  const loadData = async () => {
    try {
      await fetchUserData(controller.signal)
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('[Profile] 请求被取消')
        return
      }
      console.error('[Profile] 加载数据失败:', error)
    }
  }
  
  loadData()
  
  return () => {
    controller.abort()
  }
}, [])
```

#### 修改 2: 优化 fetchUserData 函数
```typescript
const fetchUserData = async (signal?: AbortSignal) => {
  try {
    setLoading(true)
    
    // 检查是否已取消
    if (signal?.aborted) {
      console.log('[Profile] 请求已被取消，跳过')
      return
    }
    
    // 获取当前用户
    const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser()
    
    if (signal?.aborted) return
    
    if (authError || !currentUser) {
      console.error('[Profile] 获取用户失败:', authError)
      window.location.href = '/auth'
      return
    }
    
    setUser(currentUser)
    
    // 从 users 表获取完整用户数据
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*, points")
      .eq("id", currentUser.id)
      .single()
      
    if (signal?.aborted) return
    
    // ... 后续逻辑
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.log('[Profile] 请求被取消')
      return
    }
    console.error('[Profile] 获取用户数据失败:', error)
  } finally {
    if (!signal?.aborted) {
      setLoading(false)
    }
  }
}
```

#### 修改 3: 添加 isMounted 检查
```typescript
useEffect(() => {
  let isMounted = true
  const controller = new AbortController()
  
  const loadData = async () => {
    try {
      // ... 获取数据
      if (!isMounted) return
      // ... 设置状态
    } catch (error) {
      // ...
    }
  }
  
  loadData()
  
  return () => {
    isMounted = false
    controller.abort()
  }
}, [])
```

### 验证步骤
1. 登录后进入文库阅读页面
2. 退出阅读页面
3. 点击"我的"页面
4. 验证是否立即显示用户数据，而不是显示登录提示
5. 检查控制台是否还有 AbortError 错误