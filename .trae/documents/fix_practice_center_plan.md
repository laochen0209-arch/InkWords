# 备考中心修复计划（更新版）

## 问题分析

### 问题 1: 试卷数据库有内容，但前端无法正常打开试卷页面
**原因分析：**
- 在 `PracticeContent.tsx` 中，试卷列表点击后跳转到 `/practice/drill/${exam.id}`
- 但 `ExamContent.tsx` 中通过 `currentType` 从 URL 获取试卷，而不是通过 `examId` 从路由参数获取
- 这导致点击试卷后，页面没有正确加载对应的试卷内容

### 问题 2: 试卷模式语言逻辑修复
**用户要求：**
- 如果显示 `["IELTS", "TOEFL", "CET-4", "CET-6"]`（英文考试），备考中心页面的 UI 语言应该是**中文**
- 如果显示 `["HSK", "TOCFL", "BCT"]`（中文考试），备考中心页面的 UI 语言应该是**英文**
- 即：**考试类型语言与 UI 语言相反**
  - 英文考试 → 中文界面
  - 中文考试 → 英文界面

### 问题 3: TOEFL 模式繁体字修复
- 将 TOEFL 相关的中文简体字修复为繁体字

---

## 修复方案

### 修复 1: 修复试卷页面无法正常打开的问题

**文件：** `app/practice/drill/[examId]/page.tsx`

需要修改页面组件，使其能够从路由参数获取 `examId`，并传递给 `ExamContent` 组件。

**文件：** `app/practice/drill/ExamContent.tsx`

需要添加对 `examId` 的支持，当提供了 `examId` 时，直接加载对应试卷，而不是随机选择。

### 修复 2: 修复试卷模式语言逻辑

**文件：** `app/practice/PracticeContent.tsx`

修改 `handleTypeChange` 函数，确保切换考试类型时，UI 语言与考试类型语言相反：

```typescript
// 切换语言模式
const isChineseExam = ['HSK', 'BCT', 'TOCFL'].includes(newType)
const newMode = isChineseExam ? 'LEARN_CHINESE' : 'LEARN_ENGLISH'

// 切换学习模式
switchMode(newMode)

// 【修复】UI 语言与考试类型语言相反
// 中文考试(HSK/BCT/TOCFL) -> 英文界面
// 英文考试(IELTS/TOEFL/CET-4/CET-6) -> 中文界面
const newUiLang = isChineseExam ? 'en' : 'zh'
switchUiLanguage(newUiLang)
```

同时修改初始加载时的语言设置逻辑，确保页面加载时 UI 语言与当前考试类型匹配。

### 修复 3: TOEFL 繁体字修复

**文件：** `app/practice/PracticeContent.tsx`

检查 TOEFL 相关的中文显示文本，将简体字转换为繁体字：
- 检查 `EXAM_TYPE_LABELS` 中的 "托福" 是否需要改为繁体
- 检查其他相关文本

---

## 具体修改步骤

### 步骤 1: 修改 `app/practice/drill/[examId]/page.tsx`
```typescript
// 需要读取 examId 参数并传递给 ExamContent
export default function DrillExamPage({ params }: { params: { examId: string } }) {
  return <ExamContent examId={params.examId} />
}
```

### 步骤 2: 修改 `app/practice/drill/ExamContent.tsx`
1. 添加 `examId` prop
2. 修改 `fetchExam` 函数，优先根据 `examId` 获取特定试卷
3. 如果没有 `examId`，则按原来的逻辑随机选择

### 步骤 3: 修改 `app/practice/PracticeContent.tsx`
1. 第 1175-1179 行：修复 `handleTypeChange` 函数中的 UI 语言切换逻辑
   - 中文考试 -> 英文 UI
   - 英文考试 -> 中文 UI
2. 添加初始化逻辑：页面加载时根据当前考试类型设置正确的 UI 语言
3. 检查并修复 TOEFL 相关中文文本为繁体

---

## 验证清单

- [ ] 点击试卷列表中的试卷能正常打开
- [ ] 选择英文考试(IELTS/TOEFL/CET-4/CET-6)时，页面显示中文界面
- [ ] 选择中文考试(HSK/BCT/TOCFL)时，页面显示英文界面
- [ ] TOEFL 相关文本显示为繁体中文
