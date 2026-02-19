# 修复主页语言选择跳转逻辑问题

## 问题描述
用户在主页选择学习语言后，跳转逻辑不正常：
- 选择"中文"（id="en"）→ 应该跳转后显示英文界面
- 选择"英文"（id="zh"）→ 应该跳转后显示中文界面

## 问题分析

### 当前代码逻辑
1. **主页 (app/page.tsx)**:
   - `id: "en"` 对应 label: "中文"（用户想学习中文）
   - `id: "zh"` 对应 label: "英文"（用户想学习英文）
   - 保存到 localStorage: `pref_lang` = langId

2. **问题**: 
   - 主页保存的是 `pref_lang`，但 language-context.tsx 读取的是 `inkwords_learning_mode`
   - 两者 key 不一致，导致设置没有生效

### 期望逻辑
- 选择"中文" → 学习中文 → 界面显示英文（因为母语是英文）
- 选择"英文" → 学习英文 → 界面显示中文（因为母语是中文）

## 修复方案

### 1. 修改主页 (app/page.tsx)
- 将 `pref_lang` 改为 `inkwords_learning_mode`
- 将 id 值映射为 LearningMode 值
  - "en" → "LEARN_CHINESE"（学中文，母语英文）
  - "zh" → "LEARN_ENGLISH"（学英文，母语文）

### 2. 修改 language-context.tsx
- 在初始化时，如果没有 `inkwords_learning_mode`，尝试读取 `pref_lang` 作为兼容
- 确保 switchMode 正确设置所有相关字段

### 3. 修改 language-utils.ts
- 确保 getLanguageSettings 与 context 同步

## 实施步骤

1. ✅ 分析当前代码逻辑
2. 🔄 修改主页保存的 localStorage key
3. 🔄 修改 language-context.tsx 初始化逻辑
4. 🔄 测试验证修复效果

## 关键代码变更

### app/page.tsx
```typescript
const handleSelect = (langId: string) => {
  // 将 id 映射为 LearningMode
  const learningMode = langId === "en" ? "LEARN_CHINESE" : "LEARN_ENGLISH"
  localStorage.setItem('inkwords_learning_mode', learningMode)
  router.push("/auth")
}
```

### lib/contexts/language-context.tsx
```typescript
useEffect(() => {
  // 兼容旧版本 pref_lang
  const prefLang = localStorage.getItem('pref_lang')
  if (prefLang && !localStorage.getItem('inkwords_learning_mode')) {
    const mode = prefLang === "en" ? "LEARN_CHINESE" : "LEARN_ENGLISH"
    localStorage.setItem('inkwords_learning_mode', mode)
  }
  
  // 正常初始化逻辑...
}, [])
```
