## 问题原因

在 `profile-header.tsx` 中，`isChineseUI` 变量在第 141 行定义，但在第 124-138 行的 `stats` 数组中就被使用了。这导致 JavaScript 抛出 "Cannot access 'isChineseUI' before initialization" 错误。

## 修复方案

将 `isChineseUI` 的定义移到 `stats` 数组之前，确保在使用之前已经初始化。

## 需要修改的文件
- `components/profile/profile-header.tsx` - 调整变量声明顺序

请确认此计划后，我将立即实施修复。