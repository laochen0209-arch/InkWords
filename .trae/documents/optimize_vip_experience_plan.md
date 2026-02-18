# 优化 VIP 体验计划

## 任务一：修复语言逻辑错乱 Bug

### 问题分析
当前 `lib/contexts/language-context.tsx` 中的 `switchMode` 函数在切换学习模式时，会同时修改 UI 语言：
```typescript
const uiLang = mode === 'LEARN_CHINESE' ? 'en' : 'zh'
setUiLanguage(uiLang)
```

### 解决方案
将学习语言和 UI 语言彻底分离：
1. **学习语言 (targetLang)**: 用户想要学习的语言（中文/英文）
2. **UI 界面语言 (uiLanguage)**: 网站界面显示的语言，独立存储在 localStorage

### 修改内容

#### 1. 修改 `lib/contexts/language-context.tsx`
- 添加独立的 UI 语言切换函数 `switchUiLanguage(uiLang: NativeLang)`
- 修改 `switchMode` 函数，不再修改 UI 语言
- 初始化时分别从不同的 localStorage key 读取学习模式和 UI 语言
- 保持 `uiLanguage` 状态独立

#### 2. 新增 UI 语言选择组件（如需要）
- 在设置页面添加独立的 UI 语言切换选项

---

## 任务二：增加月度/年度订阅套餐 UI

### 需求
- 月费订阅：$3.99
- 年费订阅：$39.9（优惠价格）

### 修改内容

#### 1. 修改 `app/profile/page.tsx`
- 添加套餐选择状态 `selectedPlan: 'monthly' | 'yearly'`
- 创建套餐卡片 UI，包含：
  - 月度套餐卡片：$3.99/月
  - 年度套餐卡片：$39.9/年（显示优惠标签，如"省 $7.98"）
- 用户点击选中套餐后，动态传递价格给 PayPalCheckoutButton

#### 2. 套餐卡片设计
```
┌─────────────────┐  ┌─────────────────┐
│   月度会员      │  │   年度会员      │
│   $3.99/月     │  │   $39.9/年     │
│                 │  │   🔥 省 $7.98  │
│   [选择]        │  │   [选择]        │
└─────────────────┘  └─────────────────┘
```

---

## 任务三：优化 PayPal 支付成功后的回调与刷新

### 修改内容

#### 1. 修改 `components/PayPalCheckoutButton.tsx`
- 在 `onApprove` 回调中：
  1. 确认后端返回 `success: true`
  2. 使用 toast 显示明显成功提示："🎉 恭喜！Pro 会员开通成功！"
  3. 1.5 秒后执行硬刷新：`window.location.href = window.location.href`

### 代码变更示例
```typescript
const onApprove = async (data: { orderID: string }): Promise<void> => {
  // ... 调用后端 API ...
  
  if (result.success) {
    // 显示明显的成功提示
    toast.success("🎉 恭喜！Pro 会员开通成功！", {
      description: "您已成功开通 VIP 会员，享受全部特权。",
      duration: 3000,
    });

    // 1.5 秒后硬刷新
    setTimeout(() => {
      window.location.href = window.location.href;
    }, 1500);
  }
};
```

---

## 文件修改清单

1. `lib/contexts/language-context.tsx` - 分离学习语言和 UI 语言
2. `app/profile/page.tsx` - 添加套餐选择 UI
3. `components/PayPalCheckoutButton.tsx` - 优化支付成功回调

## 验证步骤

1. 切换学习语言时，UI 语言保持不变
2. 可以独立切换 UI 语言
3. 套餐选择正常工作，价格正确传递给 PayPal
4. 支付成功后显示明显提示并正确刷新页面
