## 问题诊断

### 当前状况
1. **做题记录已正确实现** - 每道题都会记录到 user_answers 表，每次考试记录到 exam_results 表
2. **错题本功能已实现** - 有 saveMistakesToBook 函数和 Review 页面

### 存在的问题
**User ID 获取方式不一致**：
- ExamContent.tsx（考试提交）: 使用 `supabase.auth.getSession()` 获取用户ID ✅
- saveMistakesToBook（保存错题）: 使用 `localStorage.getItem('userId')` ❌
- Review 页面（查看错题）: 使用 `localStorage.getItem('userId')` ❌

这会导致：
- 错题可能保存到错误的用户ID下
- 用户可能看不到自己的错题

## 修复计划

### 步骤 1: 修复 saveMistakesToBook 函数
**文件**: `app/practice/drill/ExamContent.tsx`
- 修改函数签名，接收 userId 参数
- 从 handleSubmit 传递正确的 userId

### 步骤 2: 修复 Review 页面
**文件**: `app/practice/review/page.tsx`
- 改用 `supabase.auth.getSession()` 获取用户ID
- 未登录时重定向到登录页

### 步骤 3: 验证数据一致性
- 确保错题本数据与考试记录使用相同的 user_id
- 添加错误处理和日志

## 预期结果
- 用户做完题后，错题自动保存到错题本
- 在 Review 页面可以正确查看自己的错题
- 所有功能使用统一的认证机制