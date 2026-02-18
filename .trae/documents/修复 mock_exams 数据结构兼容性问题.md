## 问题描述

N8N 生成的试卷数据结构中：

* `questions`: NULL

* `sections`: 包含 JSON 格式的题目数据

但前端代码只检查 `questions` 字段，导致有效试卷被过滤掉。

## 需要修改的文件

### 1. `/app/practice/mock/MockContent.tsx`

**修改点 1: 更新 MockExam 接口**

```typescript
interface MockExam {
  id: string;
  title_en: string;
  rewritten_content: string;
  questions: any[];
  sections: any[];  // 新增
  exam_type: string;
}
```

**修改点 2: 添加数据转换逻辑**
在 `fetchExam()` 中获取数据后，添加：

```typescript
// 兼容 N8N 生成的数据格式（sections 有数据但 questions 为 null）
if (!data.questions && data.sections) {
  const sections = typeof data.sections === 'string' 
    ? JSON.parse(data.sections) 
    : data.sections;
  // 从 sections 中提取所有 questions
  data.questions = sections.flatMap((s: any) => s.questions || []);
}
```

**修改点 3: 更新题目数量显示**

```typescript
// 原代码
{exam?.questions?.length || 0} Qs

// 新代码
{(exam?.questions?.length || exam?.sections?.reduce((acc: number, s: any) => 
  acc + (s.questions?.length || 0), 0) || 0)} Qs
```

## 预期结果

* 能正确显示 questions 为 NULL 但 sections 有内容的试卷

* 题目数量从 sections 中正确计算

* 用户可以继续正常做题

