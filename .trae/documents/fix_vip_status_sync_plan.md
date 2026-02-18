# 修复 VIP 状态同步问题计划

## 问题分析

从截图可以看到：
1. 支付成功（Console 显示"支付已批准"）
2. 但页面仍然显示"开通 Pro 会员"按钮
3. 说明 `isVip` 状态没有正确更新为 `true`

## 根本原因

1. **数据库已更新**：`capture-order` API 成功更新了 `is_pro: true` 和 `subscription_status: 'active'`
2. **前端状态未刷新**：虽然执行了 `window.location.href = window.location.href`，但可能：
   - Auth Context 没有重新获取最新用户数据
   - 或者硬刷新时使用了缓存数据
   - 或者 Supabase 会话数据没有同步

## 解决方案

### 方案 1：强制刷新用户数据（推荐）

在 `PayPalCheckoutButton.tsx` 的 `onApprove` 回调中：
1. 支付成功后，调用 `refreshSession()` 强制刷新用户数据
2. 然后再执行页面刷新

### 方案 2：优化 Auth Context 数据获取

确保 `AuthProvider` 在页面加载时正确获取最新用户数据：
1. 检查 `getUserData` 函数是否正确查询 `is_pro` 字段
2. 确保 `refreshSession` 能正确刷新用户状态

### 方案 3：添加调试日志

在关键位置添加日志，帮助排查问题：
1. `checkIsVip` 函数中添加日志
2. `AuthProvider` 中获取用户数据时添加日志
3. `profile/page.tsx` 中显示 `isVip` 值

## 修改文件

1. `components/PayPalCheckoutButton.tsx` - 调用 refreshSession 后刷新
2. `lib/contexts/auth-context.tsx` - 确保正确获取 is_pro 字段，添加调试日志
3. `app/profile/page.tsx` - 添加调试显示

## 具体修改

### 1. PayPalCheckoutButton.tsx
```typescript
// 支付成功后，先刷新用户数据，再刷新页面
if (result.success) {
  toast.success("🎉 恭喜！Pro 会员开通成功！");
  
  // 调用 refreshSession 刷新用户数据
  await refreshSession();
  
  setTimeout(() => {
    window.location.href = window.location.href;
  }, 1500);
}
```

### 2. auth-context.tsx
- 确保 `getUserData` 查询包含 `is_pro` 字段
- 在 `checkIsVip` 中添加调试日志
- 在 `AuthProvider` 初始化时添加日志

### 3. profile/page.tsx（临时调试）
```typescript
// 临时显示 isVip 值用于调试
<div>DEBUG: isVip={isVip ? 'true' : 'false'}</div>
<div>DEBUG: user?.is_pro={user?.is_pro ? 'true' : 'false'}</div>
```

## 全站 VIP 状态展示

除了修复同步问题，还需要确保 VIP 状态在全站正确展示：

1. **个人中心** - 已修复，显示 VIP Banner
2. **学习页面** - 检查是否显示 VIP 标识
3. **图书馆页面** - 检查是否显示 VIP 标识
4. **练习页面** - 检查是否显示 VIP 标识
5. **全局导航** - 检查是否显示 VIP 徽章

需要检查的文件：
- `components/global-user-nav.tsx`
- `components/dashboard/top-nav.tsx`
- `app/study/page.tsx`
- `app/library/page.tsx`
- `app/practice/page.tsx`
