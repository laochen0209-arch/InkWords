## 问题原因

`users` 表启用了 RLS（行级安全策略），但 Service Role 没有访问权限。

## 解决方案

在 Supabase Dashboard 的 SQL Editor 中执行：

```sql
-- 为 users 表配置 RLS 策略
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 允许 service role 完全访问 users 表
CREATE POLICY "Allow service role full access" ON users
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- 允许匿名用户读取 users 表（用于登录验证）
CREATE POLICY "Allow anonymous select" ON users
  FOR SELECT
  USING (true);

-- 允许匿名用户插入 users 表（用于注册）
CREATE POLICY "Allow anonymous insert" ON users
  FOR INSERT
  WITH CHECK (true);
```

或者，如果只想快速测试，可以暂时禁用 users 表的 RLS：

```sql
-- 禁用 users 表的 RLS（仅用于测试！）
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
```

## 建议操作

1. 打开 Supabase Dashboard: https://app.supabase.com
2. 进入 SQL Editor
3. 执行上面的 SQL
4. 刷新页面测试登录功能