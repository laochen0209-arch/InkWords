## 问题分析

从截图可以看到，背景图片（山水画）被放大了，只显示了局部内容。当前使用的是 `backgroundSize: 'cover'`，这会让背景图片覆盖整个屏幕，可能导致图片被裁剪和放大。

## 修复方案

将 `app/library/classics/[id]/page.tsx` 第 426 行的背景样式从：
```
backgroundSize: 'cover'
```
改为：
```
backgroundSize: 'contain',
backgroundRepeat: 'no-repeat',
backgroundColor: '#F5F0E8'
```

这样修改后：
- 图片会按照原始比例完整显示
- 如果图片比例与屏幕不匹配，会有背景色填充空白区域
- 使用 `#F5F0E8`（米黄色）作为背景色，与整体设计风格协调