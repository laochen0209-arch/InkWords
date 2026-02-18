## 问题分析

### 1. 试卷列表显示全英文（语言逻辑错误）

在 `PracticeContent.tsx` 中，试卷列表的标题 `exam.title` 和描述 `exam.description` 直接显示数据库中的英文内容，没有根据语言设置进行本地化。

### 2. Drill 页面 UI 风格不统一

`ExamContent.tsx` 中：
- 使用了英文标题如 "Listening Comprehension", "Reading Passage", "Vocabulary Section"
- 输入框 placeholder 是英文 "Enter your answer..."
- 按钮文字如 "查看解析", "收起解析" 是正确的
- 但整体风格需要与网站统一（水墨风格背景已有）

## 修复方案

### 1. 修复试卷列表语言显示

**文件**: `app/practice/PracticeContent.tsx`

- 试卷标题：如果 `uiLanguage === 'zh'` 且 `exam.title` 是英文，显示翻译后的标题
- 试卷分类标签：将英文分类翻译为中文
- 难度标签：已有中英文切换，保持不变

### 2. 统一 Drill 页面语言

**文件**: `app/practice/drill/ExamContent.tsx`

- 将 "Listening Comprehension" 改为 "听力理解"
- 将 "Reading Passage" 改为 "阅读文章"
- 将 "Vocabulary Section" 改为 "词汇运用"
- 将 "Enter your answer..." 改为 "请输入答案..."
- 将 "Questions" 改为 "题目"

### 3. 添加试卷标题翻译映射

由于试卷标题是动态数据，需要添加一个翻译映射表：
- CET-4 Practice Test → 大学英语四级模拟测试
- CET-6 Practice Test → 大学英语六级模拟测试
- IELTS Practice Test → 雅思模拟测试
- 等等...

## 具体修改

1. **PracticeContent.tsx**: 添加 `translateExamTitle` 函数，根据语言设置翻译试卷标题和分类
2. **ExamContent.tsx**: 将所有英文界面文字改为中文

请确认这个修复方案后，我将开始实施具体的代码修改。