## 问题分析

从日志可以看到：

```
POST https://btuehnzqdaaxtebzemno.supabase.co/auth/v1/token?grant_type=password 400
AuthApiError: Invalid login credentials
```

**根本原因**：

前端代码直接调用了 `supabase.auth.signInWithPassword`，但项目实际应该使用自定义的 `/api/auth` 登录 API。

查看 `app/api/auth/route.ts` 发现：

1. 后端先验证用户存在于数据库 `users` 表
2. 然后调用 `supabase.auth.signInWithPassword`
3. 如果 Auth 用户不存在，会自动创建

但前端直接调用 Supabase Auth，跳过了数据库验证，导致：

* 如果用户只在数据库存在，但不在 Supabase Auth 中 → 登录失败

* 如果用户密码在数据库中存储方式不同 → 登录失败

## 修复方案

修改 `app/auth/page.tsx`，将登录逻辑改为调用 `/api/auth` API：

```typescript
// 修改前（直接调用 Supabase）
const { data, error } = await supabase.auth.signInWithPassword({
  email: account,
  password: password,
})

// 修改后（调用自定义 API）
const res = await fetch('/api/auth', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: account, password })
})
```

请确认后我将执行修复。
