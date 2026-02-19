# 修复 VIP 特权列表排版计划

## 问题分析

从截图可以看到用户希望的排版方式：

```
[图标] 无限学习单词和句子    [图标] 解锁所有图书馆资源
[图标] 专属练习模式和考试    [图标] 优先客服支持
```

这是一个 2x2 的网格布局，每行两个项目，文字左对齐。

## 当前代码

目前代码是：
```tsx
<div className="flex flex-col items-center gap-3 mb-6">
  {vipBenefits.map((benefit, index) => (
    <div key={index} className="flex items-center gap-3 text-[#FDFBF7]/90 text-sm">
      <benefit.icon className="w-4 h-4 text-[#D4AF37]" />
      <span>{benefit.text}</span>
    </div>
  ))}
</div>
```

这是单列垂直排列，需要改为 2x2 网格布局。

## 修改方案

### 修改 app/profile/page.tsx

将 VIP 特权列表从 `flex flex-col items-center` 改为 `grid grid-cols-2 gap-x-8 gap-y-3`：

```tsx
<div className="grid grid-cols-2 gap-x-8 gap-y-3 mb-6 px-4">
  {vipBenefits.map((benefit, index) => (
    <div key={index} className="flex items-center gap-2 text-[#FDFBF7]/90 text-sm">
      <benefit.icon className="w-4 h-4 text-[#D4AF37]" />
      <span>{benefit.text}</span>
    </div>
  ))}
</div>
```

## 实施步骤

1. 修改 profile/page.tsx 中的 VIP 特权列表布局
2. 检查 TypeScript 错误
3. 提交并推送
