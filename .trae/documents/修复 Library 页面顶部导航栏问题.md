## 问题分析

1. **LibraryHeader 组件接口不匹配**
   - `page.tsx` 传递了 `nativeLang` prop
   - 但 `LibraryHeader` 组件没有定义这个 prop

2. **页面布局缺少顶部 padding**
   - `LibraryHeader` 是 `fixed` 定位（`fixed top-0 h-16`）
   - 但 `main` 内容区域没有添加 `pt-16` 的 padding
   - 导致内容被 header 遮挡

## 修复计划

### 文件 1: components/library/library-header.tsx
- 添加 `nativeLang` prop 到组件接口
- 或者从 page.tsx 中移除不必要的 prop 传递

### 文件 2: app/library/page.tsx
- 为 `main` 元素添加 `pt-16`（或 `pt-20`）的 padding-top
- 确保内容不会被固定的 header 遮挡

请确认此计划后，我将立即实施修复。