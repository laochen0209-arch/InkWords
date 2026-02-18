## 问题分析

### 问题 1: logger.log 不存在
`logger.ts` 中没有定义 `log` 方法，但 `app/study/page.tsx` 中使用了 `logger.log()`。

错误信息：
```
[ERROR] "获取数据失败:" TypeError: logger.log is not a function
```

### 修复方案

1. **在 logger.ts 中添加 `log` 方法**（作为 `info` 的别名）
   - 这样既有 `log` 又有 `info`，兼容两种写法

2. **或者替换所有 `logger.log` 为 `logger.info`**
   - 找到 10 处使用 `logger.log` 的地方
   - 全部替换为 `logger.info`

### 推荐方案
在 `logger.ts` 中添加 `log` 方法作为 `info` 的别名，这样：
- 不需要修改大量现有代码
- 保持向后兼容
- 符合 console API 习惯（console.log）

请确认后我将立即执行修复。