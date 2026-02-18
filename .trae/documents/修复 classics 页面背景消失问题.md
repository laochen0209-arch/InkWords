## 问题分析

classics 页面的背景设置使用了 `backgroundSize: 'contain'`，这会导致：
- 图片按照原始比例完整显示
- 如果图片比例与屏幕不匹配，图片会显示得很小，居中显示
- 看起来像"消失"了，实际上只是显示得很小

## 修复方案

将 `backgroundSize` 从 `'contain'` 改回 `'cover'`，这样图片会覆盖整个屏幕，不会显示为一个小点。

修改位置：`app/library/classics/[id]/page.tsx` 第 426 行

修改内容：
- `backgroundSize: 'contain'` → `backgroundSize: 'cover'`
- 移除 `backgroundRepeat` 和 `backgroundColor`（使用 cover 时不需要）