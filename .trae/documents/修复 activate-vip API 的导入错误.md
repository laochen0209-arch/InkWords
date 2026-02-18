## 问题分析

1. **安全漏洞**：当前使用 `x-user-email` 请求头，容易被伪造
2. **状态不同步**：前端没有正确刷新 Session，导致 VIP 状态不显示

## 修复方案

### 1. 重写后端 API (app/api/payment/activate-vip/route.ts)

使用 `@supabase/ssr` 的 `createServerClient` 配合 `cookies` 从 Cookie 中解析用户身份：

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const cookieStore = await cookies()
const supabase = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    cookies: {
      getAll() { return cookieStore.getAll() },
      setAll() { }
    }
  }
)

// 从 Session 获取用户
const { data: { user } } = await supabase.auth.getUser()
if (!user) return 401
```

### 2. 重写前端逻辑 (app/profile/page.tsx)

API 调用成功后：
1. `await supabase.auth.refreshSession()` - 刷新 JWT
2. `router.refresh()` - 更新服务端组件数据
3. 清理 URL 参数

请确认后我将执行修复。