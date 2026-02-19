# 修复 Internal Server Error 计划

## 问题分析

从截图可以看到，访问 `localhost:3000` 时出现 Internal Server Error (500)。

### 可能的原因

1. **主页 (app/page.tsx) 的 localStorage 问题**
   - 页面标记为 `"use client"`，但 Next.js 仍可能尝试服务端渲染
   - `handleSelect` 函数中直接访问 `localStorage` 可能导致错误

2. **Provider 嵌套问题**
   - `layout.tsx` 中 `AuthProvider` 和 `LanguageProvider` 在 `<html>` 外部
   - 这可能导致 hydration 问题

3. **字体加载问题**
   - 使用 `display: "optional"` 和 `preload: false` 可能导致渲染问题

## 修复方案

### 1. 修复 app/page.tsx
- 添加 `typeof window !== "undefined"` 检查
- 或者使用 `useEffect` 来延迟 localStorage 访问

### 2. 修复 layout.tsx Provider 嵌套
- 将 Provider 移到 `<html>` 内部
- 确保正确的 hydration 顺序

### 3. 检查其他可能的问题
- 清理 .next 缓存
- 检查是否有其他服务端渲染问题

## 实施步骤

1. 修复 layout.tsx - 调整 Provider 嵌套顺序
2. 修复 page.tsx - 添加 window 存在性检查
3. 清理缓存并测试
