## 🔍 完整问题清单

### 1. 头像更换功能 ❌ 完全禁用
**问题**:
- `handleAvatarClick` 和 `handleFileChange` 直接返回提示 "头像上传功能已禁用"
- 没有实现头像上传逻辑
- 头像无法与全站共通（profile-header.tsx 使用 `user.avatar`，但无法更新）

**修复方案**:
- 启用头像上传功能
- 添加 Supabase Storage 上传逻辑
- 更新数据库和 Auth metadata

### 2. 邮箱功能 ❌ 显示为空
**问题**:
- 从 `getUserData()` 获取邮箱，但用户注册时的邮箱在 Supabase Auth 中
- `user-data.ts` 中的 email 默认空，且没有与 Supabase 同步
- 页面加载时邮箱显示为空

**修复方案**:
- 使用 `useAuth` 从 Supabase Auth 获取真实邮箱
- 在 useEffect 中同步邮箱信息
- 修改 `handleNicknameSave` 成功后更新本地状态

### 3. 修改密码功能 ❌ 无法使用
**问题**:
- API 中直接比较明文密码 `userData.password !== currentPassword`
- 数据库中的密码应该是加密的，明文比较会失败
- 应该使用 Supabase Auth 验证密码

**修复方案**:
- 使用 `supabase.auth.signInWithPassword` 验证当前密码
- 或使用 `supabase.auth.updateUser`（会自动验证当前会话）
- 移除数据库明文密码比较逻辑

### 4. 修改名称功能 ❌ 状态不同步
**问题**:
- `updateUserProfile` 只更新了内存状态
- 没有持久化到 localStorage
- 刷新页面后昵称恢复默认值
- 与全站名称显示不共通

**修复方案**:
- API 调用成功后更新 localStorage
- 确保 `updateUserProfile` 触发全局状态更新
- 同步更新 `user-data.ts` 中的昵称

### 5. 验证码 API 调用错误 ❌
**问题**:
- 调用 `/api/send-code` 时 `type: 'reset_password'`
- 但 API 中只处理了 `type === 'register'` 的情况
- 缺少 `verify-code` API 路由

**修复方案**:
- 修改 type 为 `'change_email'`
- 创建 `/api/verify-code` 路由
- 或直接使用 Supabase Auth 的邮箱更新功能

## 修复步骤

1. **修复邮箱显示** - 从 Supabase Auth 获取真实邮箱
2. **启用头像上传** - 实现完整的头像上传流程
3. **修复密码修改** - 使用 Supabase Auth 验证
4. **修复昵称修改** - 确保全局状态同步
5. **修复验证码流程** - 创建 verify-code API
6. **验证所有修复**

请确认后开始修复。