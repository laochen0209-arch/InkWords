## 问题分析

从日志可以看到：
- `[USER UPDATE API] 未授权访问: Auth session missing!`
- 其他 API（如 checkin、user/me）使用 **Service Role Key + userId 查询参数** 验证用户
- 但 user/update 和 change-password API 尝试使用 cookie session，导致 401

## 解决方案

### 方案：统一使用 Service Role Key + userId

修改 user/update 和 change-password API，使用与其他 API 相同的认证方式：
1. 使用 Service Role Key 创建客户端
2. 从请求体中获取 userId
3. 前端调用时传递 userId

### 修复步骤

1. **修改 API 路由**：
   - `app/api/user/update/route.ts`
   - `app/api/user/change-password/route.ts`
   
2. **修改前端页面**：
   - `app/settings/account/page.tsx`
   - 从 useAuth 获取 user.id
   - 调用 API 时传递 userId

3. **验证修复**

请确认后开始修复。