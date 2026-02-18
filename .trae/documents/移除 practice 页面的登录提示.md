## 问题
/practice 页面显示"提示：登录以保存学习进度"的提示，即使用户已登录。

## 解决方案
移除 `PracticeContent.tsx` 中的登录提示区块（第 733-745 行）。

## 修改内容
删除以下代码：
```tsx
{/* 无数据提示 */}
{!isLoading && userStats.totalQuestions === 0 && (
  <div className="bg-white/80 backdrop-blur rounded-xl p-4 border border-gray-200 text-center">
    <p className="text-gray-600 mb-2">
      {uiLanguage === 'zh' ? '💡 提示：登录以保存学习进度' : '💡 Tip: Sign in to save your progress'}
    </p>
    <Link 
      href="/auth/login"
      className="inline-block px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
    >
      {uiLanguage === 'zh' ? '登录' : 'Sign In'}
    </Link>
  </div>
)}
```

确认后立即执行。