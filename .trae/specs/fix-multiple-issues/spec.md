# 修复多个 UI 和功能问题 Spec

## Why
用户反馈了5个需要修复的问题：
1. 支付页面字体颜色未统一为金色
2. 用户输入正确后缺少交互声音
3. 句子练习中用户只需要输入单词，不应包含标点符号
4. 备考中心试卷无法正常显示（后端有数据但前端报错）
5. 个人页面统计数据未实时更新

## What Changes
- 修改 `components/DualCheckoutPanel.tsx` 字体颜色统一为金黄色
- 修改练习页面组件，添加正确/错误音效
- 修改句子练习逻辑，过滤掉标点符号
- 修复备考中心试卷获取 API 和前端展示
- 修复个人页面统计数据实时更新机制

## Impact
- Affected specs: 支付流程、学习练习、备考中心、用户数据统计
- Affected code: 
  - `components/DualCheckoutPanel.tsx`
  - `app/practice/` 相关组件
  - `app/exam/` 或备考中心相关组件
  - `app/profile/page.tsx` 统计数据更新

## ADDED Requirements

### Requirement: 支付页面字体颜色统一
The system SHALL display all text in DualCheckoutPanel with golden/yellow color scheme.

#### Scenario: User views payment options
- **WHEN** user opens the payment panel
- **THEN** all text should use golden (#D4AF37) or yellow color family
- **AND** text should be clearly visible on dark background

### Requirement: 练习正确/错误音效
The system SHALL play sound effects when user answers correctly or incorrectly.

#### Scenario: Correct answer
- **WHEN** user inputs correct answer
- **THEN** play success sound effect
- **AND** show visual feedback (confetti)

#### Scenario: Incorrect answer
- **WHEN** user inputs wrong answer
- **THEN** play error sound effect
- **AND** show error message

### Requirement: 句子练习过滤标点符号
The system SHALL only require users to input words without punctuation marks.

#### Scenario: Sentence practice with punctuation
- **GIVEN** a sentence "After a long day, I unwind..."
- **WHEN** user inputs words
- **THEN** system should ignore punctuation (comma, period, etc.)
- **AND** only validate the actual words

## MODIFIED Requirements

### Requirement: 备考中心试卷显示
The exam center SHALL properly fetch and display exam papers from the database.

#### Scenario: User opens exam center
- **GIVEN** database has exam papers (mock_exams table)
- **WHEN** user navigates to exam center
- **THEN** fetch papers from API successfully
- **AND** display exam list without errors

### Requirement: 个人页面统计数据实时更新
The profile page SHALL display real-time updated statistics.

#### Scenario: After learning session
- **GIVEN** user completed learning some words
- **WHEN** user returns to profile page
- **THEN** "已学单词" count should reflect new words
- **AND** "学习天数" and "准确率" should update accordingly

## REMOVED Requirements

None
