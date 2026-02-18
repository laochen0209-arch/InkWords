# 修复 Gumroad Webhook TypeScript 错误计划

## 问题分析

构建失败日志显示：
```
Type error: Argument of type 'any' is not assignable to parameter of type 'never'.
```

发生在 `app/api/webhooks/gumroad/route.ts` 第 139 行：
```typescript
.update(updateData as any)
```

根本原因是 Supabase 客户端的类型推断问题，`createClient` 返回的类型在 `.from('users').update()` 链式调用中推断为 `never`。

## 解决方案

将 supabase 客户端实例断言为 `any` 类型，绕过 TypeScript 的严格类型检查。

## 修改内容

文件：`app/api/webhooks/gumroad/route.ts`

修改第 137-140 行：
```typescript
// 修改前
const { error } = await supabase
  .from('users')
  .update(updateData as any)
  .eq('id', userId)

// 修改后
const { error } = await (supabase as any)
  .from('users')
  .update(updateData)
  .eq('id', userId)
```

## 验证步骤

1. 修改代码
2. 运行 TypeScript 编译检查
3. 提交并 push 到 GitHub
