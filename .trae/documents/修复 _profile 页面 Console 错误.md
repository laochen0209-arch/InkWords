## 问题分析

从截图中可以看到 `/profile` 页面有红色 console 错误，主要包括：

1. **通知 API 错误** - `/api/notifications/vapid-public-key` 和 `/api/notifications/subscribe` 调用失败
2. **可能的翻译键访问错误** - `t.profile?.stats?.xxx` 返回 undefined
3. **Service Worker 注册错误** - `sw.js` 可能不存在

## 修复方案

### 1. 修复通知 API 错误
- 在 `use-notifications.ts` 中添加更健壮的错误处理
- 添加 API 可用性检查，避免不必要的请求
- 改进错误信息显示

### 2. 修复翻译键访问
- 在 `profile-header.tsx` 中为翻译键提供默认值
- 在 `settings-list.tsx` 中为翻译键提供默认值

### 3. 添加缺失的 Service Worker 文件
- 创建 `public/sw.js` 文件（如果不存在）

### 4. 改进错误边界
- 添加错误边界处理，防止单个组件错误影响整个页面

## 需要修改的文件
1. `lib/hooks/use-notifications.ts` - 增强错误处理
2. `components/profile/profile-header.tsx` - 添加翻译默认值
3. `components/profile/settings-list.tsx` - 添加翻译默认值
4. `public/sw.js` - 创建 Service Worker 文件（如不存在）

请确认此计划后，我将开始实施修复。