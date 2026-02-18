## 修复计划

### 1. 统一UI风格和背景
修改 `ExamContent.tsx` 的背景样式，与备考中心保持一致的水墨风格。

### 2. 修复点击跳转到空白界面问题
- 修复 `handleNextExam` 函数，不使用 `window.location.reload()`
- 添加错误边界和异常处理
- 修复 RadioGroup 点击处理，添加安全检查

### 3. 检查备考中心问题
- 检查数据加载逻辑
- 确保空状态正确处理

## 具体修改

**文件1**: `app/practice/drill/ExamContent.tsx`
- 统一背景样式
- 修复 handleNextExam
- 添加错误处理

**文件2**: `app/practice/PracticeContent.tsx`
- 检查并修复潜在问题

请确认后我将执行修复。