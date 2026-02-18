## 问题分析

从终端日志可以看到 Auth Context 的状态一直是 `loading`，说明 `initializeAuth` 函数没有执行完成。

### 根本原因

1. **`isInitializing` ref 在页面切换时没有重置**
   - 当用户在一个页面停留很久后，`isInitializing.current` 可能仍然是 `true`
   - 点击"我的"页面时，`initializeAuth` 检测到 `isInitializing.current === true`，直接返回

2. **`isMounted` ref 在页面切换时的状态**
   - 页面切换时，旧的 `isMounted` 被设置为 `false`
   - 新的组件挂载，`isMounted` 被设置为 `true`
   - 但 `isInitializing` 仍然是 `true`

### 修复方案

#### 1. 修改 `lib/contexts/auth-context.tsx`

**方案 A：移除 `isInitializing` ref，使用 `useState` 替代**
```typescript
const [isInitializing, setIsInitializing] = useState(false)

const initializeAuth = useCallback(async () => {
  if (isInitializing) {
    console.log('[Auth] 初始化已在进行中，跳过')
    return
  }
  
  setIsInitializing(true)
  
  try {
    // ... 初始化逻辑
  } finally {
    setIsInitializing(false)
  }
}, [isInitializing])
```

**方案 B：在 `useEffect` 清理函数中重置 `isInitializing`**
```typescript
useEffect(() => {
  console.log('[Auth] 组件挂载，开始初始化...')
  isMounted.current = true
  isInitializing.current = false  // 重置初始化标记
  
  // ... 后续逻辑
}, [initializeAuth, fetchUserProfile])
```

#### 2. 添加超时机制

如果 `getSession` 调用卡住，添加超时处理：
```typescript
const initializeAuth = useCallback(async () => {
  // 添加超时处理
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('初始化超时')), 10000)
  })
  
  try {
    const { data: { session }, error: sessionError } = await Promise.race([
      supabase.auth.getSession(),
      timeoutPromise
    ])
    // ...
  } catch (error) {
    console.error('[Auth] 初始化超时或失败:', error)
    setAuthState({ status: 'unauthenticated', user: null })
  }
}, [])
```

#### 3. 修改 profile 页面的加载逻辑

在 profile 页面添加对 `authLoading` 的超时处理：
```typescript
useEffect(() => {
  // 如果 authLoading 持续太久，强制刷新
  const timeout = setTimeout(() => {
    if (authLoading) {
      console.log('[Profile] Auth 加载超时，强制刷新')
      window.location.reload()
    }
  }, 5000)
  
  return () => clearTimeout(timeout)
}, [authLoading])
```

### 推荐方案

**方案 B + 超时机制** 是最简单有效的修复方式：
1. 在 `useEffect` 开始时重置 `isInitializing`
2. 添加 `getSession` 超时处理
3. 确保 `finally` 块中总是重置状态

### 验证步骤

1. 刷新页面
2. 在一个页面停留 1-2 分钟
3. 点击"我的"页面
4. 检查是否正常显示用户资料