## 问题分析

Service Role Key 已添加到 `.env.local`，但仍然出现 `permission denied` 错误。可能原因：

1. Next.js 服务器没有重新加载环境变量
2. `createAdminClient` 可能抛出错误但未被正确捕获

## 解决方案

在 subscribe API 中添加调试日志，确认：
1. Service Role Key 是否正确加载
2. `createAdminClient` 是否成功创建
3. 捕获并显示详细的错误信息

## 需要修改的文件

1. `app/api/notifications/subscribe/route.ts` - 添加调试日志和错误处理

## 修改内容

- 在调用 `createAdminClient()` 前添加日志，检查环境变量
- 添加 try-catch 块捕获 `createAdminClient` 的可能错误
- 确保错误信息正确返回给前端

请确认后我将执行修复。