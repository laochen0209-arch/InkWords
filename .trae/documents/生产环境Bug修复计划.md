# InkWords 生产环境 Bug 修复计划

## 概述

本计划针对生产环境 (inkwords.cn) 发现的 3 个严重 Bug 进行修复。

---

## 任务一：修复"目标语言"与"UI界面语言"的混淆逻辑

### 问题分析

**根本原因**：当用户在首页点击"学习中文"时，`switchMode` 函数只更新了 `learningMode`、`nativeLang`、`targetLang`，但没有同步更新 `uiLanguage`。

**代码追踪**：
1. `app/page.tsx:18-26` - `handleSelect` 调用 `switchMode(learningMode)`
2. `lib/contexts/language-context.tsx:113-137` - `switchMode` 函数不修改 `uiLanguage`
3. `app/auth/page.tsx:31` - 登录页使用 `uiLanguage` 决定界面语言

**问题场景**：
- 用户之前使用过中文界面 → `localStorage.inkwords_ui_language = "zh"`
- 用户点击"学习中文" → `switchMode("LEARN_CHINESE")` 不修改 `uiLanguage`
- 跳转到登录页 → 界面显示中文（老外看不懂）

### 修复方案

#### 1.1 修改 `app/page.tsx` - 首页选择逻辑

**文件**: `app/page.tsx`

**修改内容**：
```typescript
// 在 handleSelect 函数中，调用 switchMode 后，根据学习模式设置 UI 语言
const handleSelect = (langId: string) => {
  const learningMode = langId === "en" ? "LEARN_CHINESE" : "LEARN_ENGLISH"
  
  // 切换学习模式
  switchMode(learningMode)
  
  // 【新增】根据学习模式设置 UI 语言
  // 学中文 → 英文界面（老外），学英文 → 中文界面（中国人）
  const uiLang = langId === "en" ? "en" : "zh"
  switchUiLanguage(uiLang)
  
  router.push("/auth")
}
```

#### 1.2 修改 `lib/contexts/language-context.tsx` - 初始化逻辑

**文件**: `lib/contexts/language-context.tsx`

**修改内容**：
- 当没有保存的 `uiLanguage` 时，根据浏览器语言或学习模式智能推断默认值
- 添加 `detectBrowserLanguage` 辅助函数

---

## 任务二：恢复 VIP (Pro) 权限校验与免费额度限制

### 问题分析

**现状**：
1. `lib/quotas/check-quotas.ts` 中已有完整的配额检查逻辑
2. 但客户端组件没有正确调用这些校验
3. `DualCheckoutPanel` 组件存在但未被正确使用

**免费用户限制策略**（已在 `check-quotas.ts` 中定义）：
- 每日学习：5次/天
- 每日阅读：5次/天
- 练习券：初始5张，消耗制

### 修复方案

#### 2.1 创建客户端配额检查 API

**新建文件**: `app/api/user/quota/route.ts`

**功能**：
- GET: 获取用户当前配额状态
- POST: 检查并消耗配额

#### 2.2 创建配额检查 Hook

**新建文件**: `lib/hooks/use-quota.ts`

**功能**：
- `checkQuota(type)`: 检查配额
- `consumeQuota(type)`: 消耗配额
- `showUpgradeModal()`: 显示升级弹窗

#### 2.3 修改 `app/practice/PracticeContent.tsx`

**修改内容**：
- 在开始练习前检查用户 VIP 状态
- 免费用户触达限制时弹出 `DualCheckoutPanel`
- 添加升级弹窗状态管理

#### 2.4 修改 `app/practice/drill/ExamContent.tsx`

**修改内容**：
- 恢复练习券消耗逻辑
- VIP 用户免练习券
- 免费用户练习券不足时弹出升级弹窗

#### 2.5 创建升级弹窗组件

**新建文件**: `components/upgrade-modal.tsx`

**功能**：
- 统一的升级提示弹窗
- 集成 `DualCheckoutPanel`
- 显示剩余配额信息

---

## 任务三：彻底根除前端直连 Supabase 导致的 GFW 阻断问题

### 问题分析

**受影响的文件**（前端直连 Supabase）：

| 文件 | 查询的表 | 行号 |
|------|----------|------|
| `app/practice/drill/[examId]/page.tsx` | `mock_exams` | 441-445 |
| `app/practice/mock/MockContent.tsx` | `mock_exams` | 102-106 |
| `components/profile/profile-header.tsx` | `user_activities` | 65-80 |
| `app/dashboard/hooks/use-dashboard-data.ts` | `users`, `user_activities` | 86-102 |
| `lib/contexts/auth-context.tsx` | `users` | 182-186 |
| `app/auth/page.tsx` | Supabase Auth | 148-151 |

**注意**：`app/auth/page.tsx` 中的 Supabase Auth 登录是必须保留的（认证流程需要），但需要添加错误处理。

### 修复方案

#### 3.1 创建用户活动 API

**新建文件**: `app/api/user/activities/route.ts`

**功能**：
- GET: 获取用户活动记录
- 支持 `action_type` 过滤
- 支持分页

#### 3.2 创建用户统计 API

**新建文件**: `app/api/user/stats/route.ts`（已存在，需增强）

**功能**：
- GET: 获取用户统计数据
- 包含 `study_daily_count`, `library_daily_count`, `practice_tickets` 等

#### 3.3 修改 `app/practice/drill/[examId]/page.tsx`

**修改内容**：
- 移除直接创建 Supabase 客户端
- 改为调用 `/api/practice/exams?id=xxx`
- 添加 try-catch 错误处理
- 添加优雅的错误 UI

#### 3.4 修改 `app/practice/mock/MockContent.tsx`

**修改内容**：
- 移除直接导入 `supabase`
- 改为调用 `/api/practice/exams?type=xxx`
- 添加错误处理和重试逻辑

#### 3.5 修改 `components/profile/profile-header.tsx`

**修改内容**：
- 移除 `createBrowserClient`
- 改为调用 `/api/user/activities`
- 添加错误处理

#### 3.6 修改 `app/dashboard/hooks/use-dashboard-data.ts`

**修改内容**：
- 移除 `createBrowserClient`
- 改为调用 `/api/user/stats` 和 `/api/user/activities`
- 添加错误处理

#### 3.7 修改 `lib/contexts/auth-context.tsx`

**修改内容**：
- 用户资料获取改为调用 `/api/user/profile`（需新建）
- 保留 Supabase Auth 相关功能（登录、登出、会话管理）

#### 3.8 创建用户资料 API

**新建文件**: `app/api/user/profile/route.ts`

**功能**：
- GET: 获取用户完整资料
- 包含所有 `users` 表字段

#### 3.9 添加全局错误处理组件

**新建文件**: `components/error-boundary.tsx`

**功能**：
- 捕获网络错误
- 显示友好的错误提示
- 提供重试按钮

---

## 实施顺序

### 第一阶段：API 层建设（无破坏性）
1. 创建 `/api/user/activities`
2. 创建 `/api/user/profile`
3. 增强 `/api/user/stats`
4. 创建 `/api/user/quota`

### 第二阶段：前端重构
1. 修改 `use-dashboard-data.ts`
2. 修改 `profile-header.tsx`
3. 修改 `MockContent.tsx`
4. 修改 `[examId]/page.tsx`
5. 修改 `auth-context.tsx`

### 第三阶段：权限校验
1. 创建 `use-quota.ts` Hook
2. 创建 `upgrade-modal.tsx` 组件
3. 修改 `PracticeContent.tsx`
4. 修改 `ExamContent.tsx`

### 第四阶段：语言逻辑修复
1. 修改 `app/page.tsx`
2. 增强 `language-context.tsx`

### 第五阶段：测试与验证
1. 运行 `npm run build`
2. 本地测试所有功能
3. 验证 GFW 环境下的网络请求

---

## 风险评估

| 风险 | 级别 | 缓解措施 |
|------|------|----------|
| API 路由性能问题 | 中 | 添加缓存机制 |
| 认证流程中断 | 高 | 保留 Supabase Auth 客户端 |
| 用户体验变化 | 低 | 添加加载状态和错误提示 |

---

## 验收标准

### 任务一验收
- [ ] 点击"学习中文"后，登录页显示英文界面
- [ ] 点击"学习英文"后，登录页显示中文界面
- [ ] UI 语言可独立切换，不影响学习语言

### 任务二验收
- [ ] 免费用户每日学习超过5次时弹出升级提示
- [ ] 免费用户每日阅读超过5次时弹出升级提示
- [ ] 免费用户练习券用完时弹出升级提示
- [ ] VIP 用户无任何限制

### 任务三验收
- [ ] 浏览器控制台无 `supabase.co` 直接请求
- [ ] 所有数据请求走 `/api/*` 路由
- [ ] 网络错误时显示友好提示
- [ ] `npm run build` 无错误

---

## 文件变更清单

### 新建文件
- `app/api/user/activities/route.ts`
- `app/api/user/profile/route.ts`
- `app/api/user/quota/route.ts`
- `lib/hooks/use-quota.ts`
- `components/upgrade-modal.tsx`
- `components/error-boundary.tsx`

### 修改文件
- `app/page.tsx`
- `lib/contexts/language-context.tsx`
- `app/practice/PracticeContent.tsx`
- `app/practice/drill/[examId]/page.tsx`
- `app/practice/mock/MockContent.tsx`
- `components/profile/profile-header.tsx`
- `app/dashboard/hooks/use-dashboard-data.ts`
- `lib/contexts/auth-context.tsx`
- `app/api/user/stats/route.ts`（增强）

---

*计划创建时间: 2026-02-20*
*计划版本: 1.0*
