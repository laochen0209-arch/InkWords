# 优化 study 页面交互逻辑

## 当前问题

在 `app/study/page.tsx` 中，当用户输入正确答案后，系统会自动跳转到下一个内容：

```typescript
if (normalizedUser === normalizedCorrect) {
    setFeedbackStatus('correct')
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
    
    // 正确输入后自动跳转到下一个内容
    setTimeout(() => {
      handleNext()
    }, 1000) // 延迟1秒，让用户看到正确反馈
}
```

## 用户需求

用户希望：
1. 输入正确后**不自动跳转**
2. 显示"正确"反馈和庆祝动画
3. 等待用户按**回车键**或**空格键**再跳转到下一个

## 修复计划

### 1. 移除自动跳转逻辑
删除 `handleCheck` 函数中的自动跳转代码：
```typescript
// 删除这部分代码
setTimeout(() => {
  handleNext()
}, 1000)
```

### 2. 修改键盘监听逻辑
在全局键盘监听中，添加对空格键的支持：
```typescript
// 当前只监听 Enter 键
if (e.key === 'Enter' && mode === 'B' && currentItem) {
  if (feedbackStatus === 'correct') {
    handleNext()
  }
}

// 修改为监听 Enter 和 Space 键
if ((e.key === 'Enter' || e.key === ' ') && mode === 'B' && currentItem) {
  if (feedbackStatus === 'correct') {
    handleNext()
  }
}
```

### 3. 添加视觉提示
在正确反馈显示时，添加提示文字告诉用户可以按回车或空格继续：
```typescript
// 在反馈区域添加提示
{feedbackStatus === 'correct' && (
  <p className="text-sm text-gray-500 mt-2">
    按回车键或空格键继续
  </p>
)}
```

## 预期效果

1. ✅ 用户输入正确后，显示"正确"反馈和庆祝动画
2. ✅ 不自动跳转到下一个内容
3. ✅ 用户按回车键或空格键后，才跳转到下一个
4. ✅ 给用户足够的时间查看正确答案

## 修改文件

- `app/study/page.tsx`