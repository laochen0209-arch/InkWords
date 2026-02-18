## 问题分析

从日志可以看到：
- 用户ID获取成功了！`方式0成功，用户ID: 2222cf2a-...`
- 但出现了新错误：`question.answer.trim is not a function`

这说明 `question.answer` 不是字符串，可能是：
- 数组（多选题答案）
- 数字
- null/undefined

## 修复方案

修改第1121行的答案比较逻辑，兼容不同类型的答案：

```typescript
// 将答案转换为字符串进行比较
const correctAnswer = String(question.answer || '').trim().toLowerCase();
const userAnswer = String(userAns || '').trim().toLowerCase();
if (userAnswer === correctAnswer) {
  correctCount++;
}
```

## 修改文件

**文件**: `app/practice/drill/ExamContent.tsx`

修改计算得分的逻辑，使用 `String()` 转换答案类型。
