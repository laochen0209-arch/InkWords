## 问题根源

系统使用了自定义密码验证，没有创建 Supabase Auth Session Cookie：

1. **登录 API** (`/api/auth`)：只验证数据库密码，没有调用 `supabase.auth.signInWithPassword()`
2. **Server Client**：`persistSession: false`
3. **User Me API**：通过 `x-user-email` Header 识别用户

**结果**：登录后没有 Session Cookie，Middleware 的 `getSession()` 返回 null，被重定向到 `/auth`

## 修复方案

### 修改 `app/api/auth/route.ts`
使用 `@supabase/ssr` 创建 Server Client，调用 `signInWithPassword()` 创建 Session：

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// 在 POST 中：
const cookieStore = cookies()
const supabase = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { cookies: { getAll, setAll } }
)

// 使用 supabase.auth.signInWithPassword() 创建 Session
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
})
```

### 需要的前提条件
- 用户必须在 Supabase Auth 中注册（不只是数据库 users 表）
- 或者使用 `signUp()` 先创建 Auth 用户

### 备选方案
如果用户数据只在数据库中，可以使用 `supabase.auth.admin.createUser()` 或手动设置 Session。

请确认后执行修改。