# 修复 TypeScript 编译错误

## 问题描述

部署时出现 TypeScript 编译错误：

```
Type error: Property 'abortSignal' does not exist on type 'PostgrestBuilder<any, any, false>'.

237 |             .eq("id", examId) 
238 |             .single() 
239 |             .abortSignal(abortControllerRef.current!.signal);
```

## 原因分析

Supabase 的 TypeScript 类型定义中，`PostgrestBuilder` 类型没有 `abortSignal()` 方法。

## 修复方案

移除 `.abortSignal()` 调用，因为：
1. Supabase JS SDK 不支持该方法
2. 组件中已有 `isMounted` 标志位来防止重复请求
3. 可以通过 AbortController 来实现请求取消，但需要使用不同的方式

## 修复步骤

### 步骤 1: 移除 .abortSignal() 调用

**文件**: `app/practice/drill/ExamContent.tsx`

移除第 239 行和第 256 行的 `.abortSignal(abortControllerRef.current!.signal)` 调用。

## 验证清单

- [x] 移除所有 `.abortSignal()` 调用
- [ ] TypeScript 编译通过
- [ ] 部署成功
