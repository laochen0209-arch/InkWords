## 问题分析

根据用户提供的截图，drill页面需要优化中英文解析显示：

### 图1 - Exam Papers 页面问题：
- 只显示了中文解析，缺少英文解析
- 需要同时显示中英文双语解析

### 图2 - Smart Drill 页面问题：
- "解析 (EN)" 标签下显示的是中文内容（应该是英文原文）
- "解析 (中文)" 标签下显示的是翻译后的中文
- 当前实现是把同一个 `analysis` 字段同时显示在两个地方

## 修改计划

### 1. 修改 `[examId]/page.tsx` (Exam Papers 页面)
- 当前已经使用了 `explanation` 和 `explanation_cn` 字段
- 需要确保同时显示中英文解析，格式统一

### 2. 修改 `ExamContent.tsx` (Smart Drill 页面)
- 当前只有一个 `analysis` 字段
- 需要修改为：
  - "解析 (EN)" 显示英文原文（假设 `analysis` 存储的是英文）
  - "解析 (中文)" 显示中文翻译（使用 `translateAnalysis()` 翻译）
- 或者如果数据库中有 `analysis_cn` 字段，优先使用

### 3. 类型定义更新
- 更新 `Question` 接口，添加 `analysis_cn` 字段支持

## 具体修改内容

#### 文件1: `app/practice/drill/[examId]/page.tsx`
- 确保答案解析区域同时显示中英文
- 优化显示格式

#### 文件2: `app/practice/drill/ExamContent.tsx`
- 修改 `renderQuestion` 函数中的解析显示逻辑
- "解析 (EN)" 显示 `question.analysis`（英文原文）
- "解析 (中文)" 显示翻译后的中文

#### 文件3: `lib/types/drill.ts`
- 添加 `analysis_cn?: string` 字段到 Question 接口

请确认这个修改方案后，我将开始实施具体的代码修改。