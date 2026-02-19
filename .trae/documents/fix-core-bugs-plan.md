# 修复核心 Bug 计划

## 问题分析

### 任务一：支付面板 UI 颜色优化
**当前状态**：`components/DualCheckoutPanel.tsx` 中的按钮文字使用金黄色 `text-[#D4AF37]`
**问题**：金色字体在水墨风格背景上不够协调
**目标**：将按钮上的"微信/支付宝"和"Credit Card"文案改为纯白色 `text-white`

### 任务二与任务四：备考中心试卷与目标语言强绑定
**当前状态**：`app/practice/PracticeContent.tsx` 没有与用户的 `targetLang` 关联
**问题**：
1. 下拉框切换无效
2. 考试类型没有根据目标语言过滤
**目标**：
1. 从 Context 获取 `targetLang`
2. 建立考试类型映射字典：
   - 中文学习（targetLang='zh'）→ ['HSK', 'TOCFL', 'BCT']
   - 英文学习（targetLang='en'）→ ['IELTS', 'TOEFL', 'CET-4', 'CET-6']
3. 默认选中第一个考试类型
4. 下拉框切换时重新请求数据

### 任务三：个人中心学习数据实时同步
**当前状态**：`components/profile/profile-header.tsx` 已有部分实现
**问题**：数据可能没有正确刷新
**目标**：
1. 确保 `useEffect` 正确获取数据
2. 页面挂载/聚焦时刷新数据
3. 学习后返回时数据更新

## 修改方案

### 1. 修改 DualCheckoutPanel.tsx
将以下文字颜色从 `text-[#D4AF37]` 改为 `text-white`：
- "微信 / 支付宝" 主标题
- "爱发电支持" 副标题
- "Credit Card / PayPal" 主标题
- "Patreon支持" 副标题
- 套餐选择页面的标题和价格

### 2. 修改 PracticeContent.tsx
1. 从 `useLanguage` 获取 `targetLang`
2. 创建考试类型映射字典
3. 根据目标语言过滤考试选项
4. 修复下拉框交互逻辑
5. 切换考试类型时重新请求 `mock_exams` 数据

### 3. 验证 profile-header.tsx
1. 检查 `useEffect` 数据获取逻辑
2. 确认 `visibilitychange` 事件监听正常工作
3. 确保学习后数据能正确更新

## 实施步骤

1. 修改 DualCheckoutPanel.tsx - 按钮文字改为白色
2. 修改 PracticeContent.tsx - 考试类型与目标语言绑定
3. 验证 profile-header.tsx - 数据实时同步
4. 检查 TypeScript 错误
5. 提交并推送
