修改 \[examId]/page.tsx 中的解析显示逻辑：

1. **废弃旧逻辑**：

   * 不再使用 `explanation` 字段作为主要显示

   * 移除 `containsChinese` 判断和混合显示逻辑

2. **新的双语渲染逻辑**：

   * Explanation (EN): 读取 `currentQ.explanation_en`，为空则不显示

   * Explanation (CN): 读取 `currentQ.explanation_cn`，为空则回退到 `explanation`

3. **样式要求**：

   * 英文：font-sans（标准英文字体）

   * 中文：font-serif + text-gray-600（衬线体，颜色稍浅）

   * 严禁英文区域显示中文字符

4. **修改范围**：

   * 替换第287-340行的解析显示代码

   * 保持其他部分不变

