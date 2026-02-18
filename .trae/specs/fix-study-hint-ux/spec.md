# 修复学英文模式提示按钮 UX 问题

## Why
在学英文模式下（LEARN_ENGLISH），当用户点击"眼睛"提示按钮时，输入框会直接显示正确答案（单词或句子），导致用户无法参考答案自行输入练习。这违背了提示功能的初衷——提示应该显示在下方详情区域供参考，而不是直接填充到输入框中。

## What Changes
- **修复词语模式**：学英文模式下，点击眼睛按钮时输入框不再显示正确答案
- **修复句子模式**：学英文模式下，点击眼睛按钮时输入框不再显示正确答案
- **保持输入框可编辑**：移除 `readOnly={showHint}` 限制，用户可以随时输入
- **提示答案显示在下方**：正确答案只在 Word/Sentence Details 区域显示

## Impact
- 受影响文件：`app/study/page.tsx`
- 受影响模式：LEARN_ENGLISH 模式下的词语和句子练习
- 用户体验：用户可以看着下方提示自行输入，提升练习效果

## ADDED Requirements
### Requirement: 提示按钮 UX 优化
The system SHALL ensure that when the hint button (eye icon) is clicked in LEARN_ENGLISH mode:

#### Scenario: 词语模式
- **WHEN** 用户点击眼睛按钮
- **THEN** 输入框保持空白/显示占位符
- **AND** 正确答案显示在下方 Word Details 区域

#### Scenario: 句子模式
- **WHEN** 用户点击眼睛按钮
- **THEN** 各个单词输入框保持空白/显示下划线
- **AND** 完整句子显示在下方 Sentence Details 区域

## MODIFIED Requirements
### Requirement: 输入框显示逻辑
原逻辑：`value={showHint ? correctAnswer : userInput}`
新逻辑：`value={userInput || ''}`

### Requirement: 输入框只读状态
原逻辑：`readOnly={showHint || feedbackStatus === 'correct'}`
新逻辑：`readOnly={feedbackStatus === 'correct'}`
