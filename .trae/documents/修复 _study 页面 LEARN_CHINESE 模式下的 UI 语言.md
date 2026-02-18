## 问题分析

当前代码逻辑有误：
- `isLearnChinese` 为 true (LEARN_CHINESE 模式) 时，分类显示中文
- 但截图显示 LEARN_CHINESE 模式下应该显示英文界面

## 修复方案

需要修改两个地方：

1. **分类按钮** (第 81-84 行)：
   - 当前：`isLearnChinese ? '生活' : 'Lifestyle'`
   - 修复：`isLearnChinese ? 'Lifestyle' : '生活'`

2. **进度文本** (第 1140 行)：
   - 当前：固定显示 "进度"
   - 修复：`isLearnChinese ? 'Progress' : '进度'`

## 修复后的效果

- LEARN_CHINESE 模式：显示英文 UI (Lifestyle/Professional/Progress)
- LEARN_ENGLISH 模式：显示中文 UI (生活/职场/进度)

确认后我将执行修复。