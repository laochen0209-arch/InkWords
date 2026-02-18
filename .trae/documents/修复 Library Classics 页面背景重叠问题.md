## 问题分析

在 `app/library/classics/[id]/page.tsx` 第 426 行，背景图片设置有问题：

```javascript
style={{ 
  backgroundImage: 'url("/去文字.png")', 
  backgroundSize: '50%', 
  backgroundPosition: 'center', 
  backgroundRepeat: 'no-repeat' 
}}
```

问题：
1. `backgroundSize: '50%'` - 图片缩小到 50%，但容器很大时视觉上会出现重复感
2. 背景图片没有固定，滚动时会产生视觉上的重叠效果

## 修复方案

将背景样式改为以下之一：

**方案 1（推荐）**: 使用 `cover` 让背景图片覆盖整个视口
- `backgroundSize: 'cover'` - 图片覆盖整个容器
- `backgroundAttachment: 'fixed'` - 背景固定不随滚动

**方案 2**: 使用 `100%` 让背景图片填满宽度
- `backgroundSize: '100% auto'` - 宽度 100%，高度自适应

## 需要修改的文件
- `app/library/classics/[id]/page.tsx` - 第 426 行背景样式

请确认此计划后，我将立即实施修复。