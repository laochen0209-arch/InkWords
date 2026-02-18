## 前端已完成
登录页面已添加忘记密码功能，包含：
1. "忘记密码？"链接
2. Modal 弹窗（两步流程）
3. 发送验证码功能
4. 重置密码功能

## 需要创建的后端 API

### 1. `/api/forgot-password/send-code`
- 接收邮箱地址
- 调用 `supabase.auth.signInWithOtp({ email })` 发送验证码
- 返回成功/失败状态

### 2. `/api/forgot-password/reset`
- 接收邮箱、验证码、新密码
- 调用 `supabase.auth.verifyOtp({ email, token, type: 'email' })` 验证
- 验证成功后调用 `supabase.auth.updateUser({ password: newPassword })` 重置密码
- 返回成功/失败状态

## 文件创建清单
1. `app/api/forgot-password/send-code/route.ts`
2. `app/api/forgot-password/reset/route.ts`

请确认后我将创建这两个 API 文件。