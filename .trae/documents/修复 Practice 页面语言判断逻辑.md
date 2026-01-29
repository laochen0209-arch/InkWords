## 问题根源

Practice 页面使用了错误的变量来判断 UI 语言：

**当前错误代码：**
```tsx
const { learningMode } = useLanguage()
// ...
{learningMode === 'zh' ? '中文' : 'English'}
```

**问题：**
- `learningMode` 的值是 `'LEARN_ENGLISH'` 或 `'LEARN_CHINESE'`
- 不是 `'zh'` 或 `'en'`
- 所以 `learningMode === 'zh'` 永远为 false

**正确的语言上下文逻辑：**
```tsx
const { uiLanguage } = useLanguage()
// ...
{uiLanguage === 'zh' ? '中文' : 'English'}
```

## 修复内容

将 practice/page.tsx 中所有语言判断从 `learningMode` 改为 `uiLanguage`：

1. 第316行：解构获取 `uiLanguage` 而不是用 `learningMode` 判断
2. 所有 `learningMode === 'zh'` 改为 `uiLanguage === 'zh'`
3. FeatureCard 组件中从 localStorage 读取的也改为使用 `uiLanguage`

## 需要修改的位置（共约30处）

- 页面标题
- 统计标签
- 能力评估区
- 功能卡片
- 加载提示
- 空状态提示
- 按钮文本
- 锁定状态文本

请确认后我将执行修复。