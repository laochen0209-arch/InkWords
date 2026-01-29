## 问题分析

当前 practice 页面存在语言逻辑混乱的问题：

1. **使用了语言系统但未充分利用**：
   - 第310-311行引入了 `useLanguage` 和 `TRANSLATIONS`
   - 但页面中大部分文本仍然是硬编码的中英文混合

2. **具体混乱点**：
   - 标题区："备考中心" + "Practice Center"（中英混合）
   - 统计标签："连续天数"、"完成题目"、"正确率"（纯中文）
   - 但 "Ink Drops"、"Current / Target" 又是英文
   - 能力评估区："能力评估" + "Skill Analysis"（中英混合）

3. **功能卡片问题**：
   - 使用 `currentTrack` 判断语言，但应该使用 `learningMode`
   - 标题和描述的语言逻辑不一致

## 修复方案

统一使用 `learningMode` 控制整个页面的语言显示：

### 1. 页面标题区
- 中文模式："备考中心" / "Practice Center"
- 英文模式："Practice Center" / "备考中心"

### 2. 统计卡片标签
- 中文模式：连续天数 / 完成题目 / 正确率 / Ink Drops
- 英文模式：Streak / Questions / Accuracy / Ink Drops

### 3. 能力评估区
- 中文模式：能力评估 / Skill Analysis
- 英文模式：Skill Analysis / 能力评估

### 4. 功能卡片
- 统一使用 `learningMode` 判断
- 智能刷题、全真模考、错题本等根据模式切换语言

### 5. 其他文本
- 加载提示、空状态提示等统一使用语言变量

请确认后我将实施修复。