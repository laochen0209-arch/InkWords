## 问题分析

从终端日志可以看到：
```
[Auth] 当前状态: {
  status: 'loading',
  isLoading: true,
  isAuthenticated: false,
  userId: null,
  isVip: false
}
```

Auth Context 的状态一直是 `loading`，没有完成初始化。

## 根本原因

1. **`useEffect` 依赖数组问题**：`[initializeAuth, fetchUserProfile]` 导致 `useEffect` 在每次渲染时都可能重新执行
2. **`isInitializing` ref 的复杂性**：在 React 的严格模式下，ref 的值可能在多次渲染间不一致
3. **`Promise.race` 可能有问题**：Supabase 的 `getSession()` 返回的可能不是标准 Promise

## 修复方案

### 简化 `auth-context.tsx`

移除复杂的 ref 逻辑，使用简单的 `useState` 和空依赖数组：

```typescript
export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({ status: 'loading', user: null })
  
  useEffect(() => {
    let isMounted = true
    
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (!isMounted) return
        
        if (error || !session?.user) {
          setAuthState({ status: 'unauthenticated', user: null })
          return
        }
        
        // 获取用户资料...
        const user = await fetchUserProfile(session.user)
        
        if (isMounted && user) {
          setAuthState({ status: 'authenticated', user })
        }
      } catch (error) {
        if (isMounted) {
          setAuthState({ status: 'unauthenticated', user: null })
        }
      }
    }
    
    initializeAuth()
    
    return () => {
      isMounted = false
    }
  }, []) // 空依赖数组，只在挂载时执行
  
  // ...
}
```

### 关键修改

1. **将 `initializeAuth` 移到 `useEffect` 内部**：避免依赖数组问题
2. **使用局部变量 `isMounted`**：替代 ref，避免跨渲染问题
3. **移除 `isInitializing` ref**：简化逻辑
4. **空依赖数组 `[]`**：确保只在组件挂载时执行一次

### 验证步骤

1. 刷新页面
2. 检查控制台是否有 `[Auth] 组件挂载` 日志
3. 检查 `getSession` 是否返回正确结果
4. 验证状态是否从 `loading` 变为 `authenticated`