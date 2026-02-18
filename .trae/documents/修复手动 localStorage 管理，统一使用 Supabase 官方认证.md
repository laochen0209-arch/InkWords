## 问题分析

发现了多处手动操作 localStorage 管理认证状态的地方：

1. **lib/supabase.ts:114** - `localStorage.getItem('userId')`
2. **app/auth/page.tsx:118-119** - 登录时手动设置 `isLoggedIn` 和 `inkwords_user`
3. **app/register/page.tsx:279-281** - 注册时手动设置 `inkwords_user`, `isLoggedIn`, `userId`
4. **app/settings/page.tsx:83-85** - 登出时手动移除
5. **app/profile/logout-button.tsx:11-14** - 登出时手动移除
6. **app/checkin/page.tsx** - 多处使用 `inkwords_user` 和 `userId`
7. **app/home/page.tsx** - 使用 `isLoggedIn` 和 `inkwords_user`
8. **app/study/page.tsx** - 使用 `inkwords_user` 和 `userId`

这些手动管理导致与 Supabase 的自动会话管理冲突，产生 AuthSessionMissingError。

## 修复方案

### 1. 修改 lib/supabase.ts
- 移除手动 storage 配置，让 Supabase 使用默认存储
- 移除 logUserActivity 中的 localStorage.getItem('userId')
- 添加清理旧 localStorage 字段的代码

### 2. 修改 lib/contexts/auth-context.tsx
- 添加清理旧 localStorage 字段的初始化代码
- 完全依赖 supabase.auth.getSession() 获取用户信息
- 移除任何手动 localStorage 操作

### 3. 修改登录/注册页面
- **app/auth/page.tsx** - 移除手动 localStorage.setItem
- **app/register/page.tsx** - 移除手动 localStorage.setItem
- 确保只调用 supabase.auth.signInWithPassword 和 supabase.auth.signUp

### 4. 修改登出逻辑
- **app/settings/page.tsx** - 改为调用 supabase.auth.signOut()
- **app/profile/logout-button.tsx** - 改为调用 supabase.auth.signOut()
- 移除手动 localStorage.removeItem

### 5. 修改其他使用手动 localStorage 的页面
- **app/checkin/page.tsx** - 改用 useAuth() 获取用户
- **app/home/page.tsx** - 改用 useAuth() 获取用户
- **app/study/page.tsx** - 改用 useAuth() 获取用户

### 具体代码修改

#### 修改 1: lib/supabase.ts
```typescript
// 移除手动 storage 配置
const client = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,  // 使用 Supabase 默认存储
    detectSessionInUrl: true,
    // 移除 storage 和 storageKey，使用默认配置
  },
})

// 添加清理函数
export function cleanupLegacyStorage() {
  const keysToRemove = [
    'inkwords_user',
    'userId', 
    'isLoggedIn',
    'inkwords_token',
    'inkwords_email'
  ]
  keysToRemove.forEach(key => {
    if (localStorage.getItem(key)) {
      console.log(`[Supabase] 清理旧存储: ${key}`)
      localStorage.removeItem(key)
    }
  })
}

// 修改 logUserActivity
export async function logUserActivity(...) {
  // 改用 supabase 获取当前用户
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    console.warn('[logUserActivity] 用户未登录，跳过记录')
    return
  }
  // ... 使用 user.id
}
```

#### 修改 2: lib/contexts/auth-context.tsx
```typescript
useEffect(() => {
  // 清理旧存储
  cleanupLegacyStorage()
  
  // ... 后续初始化逻辑
}, [])
```

#### 修改 3: app/auth/page.tsx
```typescript
// 登录成功后，移除手动 localStorage 操作
// 只依赖 Supabase 的自动存储
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
})
// 移除：localStorage.setItem("isLoggedIn", "true")
// 移除：localStorage.setItem("inkwords_user", JSON.stringify(result.user))
```

#### 修改 4: app/register/page.tsx
```typescript
// 注册成功后，移除手动 localStorage 操作
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: { ... }
})
// 移除：localStorage.setItem('inkwords_user', JSON.stringify(data.user))
// 移除：localStorage.setItem('isLoggedIn', 'true')
// 移除：localStorage.setItem('userId', data.user.id)
```

#### 修改 5: 登出逻辑统一修改
```typescript
// 改为调用 supabase.auth.signOut()
await supabase.auth.signOut()
// 移除所有 localStorage.removeItem
```

### 验证步骤
1. 清除浏览器所有 localStorage
2. 重新登录
3. 确认 localStorage 中只有 Supabase 官方字段（sb-*）
4. 验证页面切换时认证状态保持正常