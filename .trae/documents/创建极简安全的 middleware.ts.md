## 问题分析
之前的 middleware.ts 导致了：
1. 服务器挂起（白屏）
2. 重定向死循环

## 解决方案
创建一个极简且安全的 middleware.ts，严格遵守以下原则：

1. **只做一件事**：使用 @supabase/ssr 的 createServerClient 刷新 Session Cookie
2. **严禁重定向**：不在 Middleware 里写 redirect 跳转逻辑
3. **防止卡死**：确保 supabase.auth.getUser() 不会阻塞主线程
4. **权限检查下放**：把权限检查交给各个页面自己处理

## 代码实现
按照用户提供的代码创建 middleware.ts：
- 使用 createServerClient 处理 Cookie
- 调用 supabase.auth.getUser() 刷新 session
- 直接放行，不做任何跳转
- matcher 排除静态资源