## 核心变更：数据流向翻转

### 旧逻辑
看中文 -> 写英文

### 新逻辑 (当前需求)
看中文 (meaning 字段) -> 写拼音

---

## 任务一：安装依赖

```bash
npm install pinyin-pro
```

---

## 任务二：UI 重构 - 单词练习

### 主展示区
- **大标题**：显示中文（取自 `meaning` 字段，例如 "自动化"）
- **副标题**：显示英文（取自 `word` 字段，例如 "automation"）
- **音标**：显示英文音标（取自 `pronunciation` 字段）

### 动态输入区域 (Pinyin Input)
- 使用 `pinyin-pro` 获取中文的拼音数组
- 例如 "自动化" -> ['zi', 'dong', 'hua']
- 根据拼音数组长度，渲染对应数量的 `<input>`
- 样式：红色下划线风格，居中
- 输入一个音节后自动跳到下一个框

### 提示系统 (Hint)
- 点击"小眼睛"，在输入框上方显示对应的拼音（例如 "zi", "dong", "hua"）

### Word Details (底部详情)
- **Chinese Meaning**: 显示中文（meaning）
- **Pinyin**: 显示生成的全拼（zì dòng huà）
- **Pronunciation**: 显示英文音标（pronunciation）
- **English**: 显示英文单词（word）
- **Example**: 显示英文例句（example_sentence）

---

## 任务三：修复分类切换

在 StudyContainer 中，监听 category 变化：

```typescript
useEffect(() => {
  setWords([]); // 先清空当前列表
  refetch();    // 强制重新请求 API
}, [currentCategory]);
```

---

## 实施步骤

1. 安装 pinyin-pro
2. 修改类型定义（添加 meaning, word, example_sentence 字段）
3. 重构单词练习组件
4. 实现拼音转换逻辑
5. 修复分类切换
6. 更新答案验证逻辑

请确认后开始执行！