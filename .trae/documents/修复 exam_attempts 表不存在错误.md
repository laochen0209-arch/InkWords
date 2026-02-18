## 问题分析

错误信息：
```
[Dashboard] exam_attempts 查询失败: {code: PGRST205, ...}
Could not find the table 'public.exam_attempts' in the schema cache
```

代码设计是同时查询两个表：
- `exam_results` - 历史数据（存在）
- `exam_attempts` - 新数据（不存在）

## 修复方案

由于数据库中缺少 `exam_attempts` 表，采用**代码容错**方案：

### 修改 PracticeContent.tsx

1. **静默处理 `exam_attempts` 查询错误** - 当表不存在时，不打印错误日志
2. **优雅降级** - 只使用 `exam_results` 的数据计算统计
3. **添加注释** - 说明 `exam_attempts` 表是可选的

### 具体修改

在 `fetchUserStats` 函数中：
- 检查 `attemptsReq.error` 时，如果是表不存在的错误（PGRST205），则不打印错误
- 将 `examAttempts` 默认为空数组
- 统计计算只使用 `exam_results` 的数据

这样即使 `exam_attempts` 表不存在，应用也能正常工作。

请确认这个修复方案后，我将开始实施具体的代码修改。