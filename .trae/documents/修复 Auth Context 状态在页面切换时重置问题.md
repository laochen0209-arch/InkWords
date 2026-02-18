## 问题分析

从控制台日志可以看到：

1. **学习页面**：`[Auth] 当前状态: {isLoading: false, isVip: true, userId: 'a0d6...'}` - 认证正常
2. **我的页面**：`[Auth] 当前状态: {isLoading: true, isVip: false, userId: undefined}` - 状态被重置

关键发现：

* 学习页面有 `[Auth] ==================== useEffect 开始执行 ====================` 日志

* 我的页面没有 `useEffect 开始执行` 日志

这说明：

1. `AuthProvider` 的 `useEffect` 只在页面首次加载时执行
2. 页面切换时，`AuthProvider` 被重新渲染，但 `useEffect` 没有重新执行（因为依赖数组是 `[]`）
3. `useState(true)` 的初始值在重新渲染时被重置为 `true`

## 修复方案

### 修改 `lib/contexts/auth-context.tsx`

1. **添加** **`useRef`** **标记**，确保只在首次挂载时设置 `isLoading: true`
2. **添加** **`onAuthStateChange`** **监听器**，在认证状态变化时更新状态
3. **优化状态管理**，避免不必要的重新渲染

### 具体代码修改

```typescript
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const isInitialized = useRef(false)  // 添加标记

  useEffect(() => {
    // 如果已经初始化过，跳过
    if (isInitialized.current) {
      console.log('[Auth] 已经初始化过，跳过')
      return
    }
    
    isInitialized.current = true
    
    // ... 后续逻辑
  }, [])
  
  // ...
}
```

但这不是根本解决方案。根本问题是：**在页面切换时，Auth Context 的状态不应该被重置**。

实际上，问题可能是 **Next.js 的客户端导航导致** **`AuthProvider`** **被重新创建**。我们需要确保 `AuthProvider` 在页面切换时保持状态。

让我检查是否有其他问题导致 `AuthProvider` 被重新创建。
