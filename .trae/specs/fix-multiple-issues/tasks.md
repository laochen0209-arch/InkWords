# Tasks

## Task 1: 修复支付页面字体颜色
**Description**: 将 DualCheckoutPanel 组件中的所有文字颜色统一为金黄色/黄色系，确保在深色背景上清晰可见。

- [x] SubTask 1.1: 检查当前 DualCheckoutPanel.tsx 中的文字颜色
- [x] SubTask 1.2: 将所有文字颜色改为金黄色 (#D4AF37) 或黄色系
- [x] SubTask 1.3: 确保副标题、价格、按钮文字都使用统一颜色
- [x] SubTask 1.4: 验证深色背景上的可见性

## Task 2: 添加练习音效
**Description**: 在用户输入正确或错误时播放对应的音效。

- [x] SubTask 2.1: 查找练习页面组件（如 WordPractice、SentencePractice 等）
- [x] SubTask 2.2: 添加正确音效（success sound）
- [x] SubTask 2.3: 添加错误音效（error sound）
- [x] SubTask 2.4: 在答案验证逻辑中触发音效
- [x] SubTask 2.5: 确保音效文件存在且可播放

## Task 3: 句子练习过滤标点符号
**Description**: 修改句子练习逻辑，用户只需要输入单词，不需要输入标点符号。

- [x] SubTask 3.1: 查找句子练习组件和验证逻辑
- [x] SubTask 3.2: 修改答案验证逻辑，过滤标点符号
- [x] SubTask 3.3: 在前端显示时隐藏标点符号输入框
- [x] SubTask 3.4: 测试带标点的句子（如 "day," 应该只验证 "day"）

## Task 4: 修复备考中心试卷显示
**Description**: 修复备考中心无法获取和显示试卷的问题。

- [x] SubTask 4.1: 查找备考中心页面和 API 路由
- [x] SubTask 4.2: 检查 API 是否正确查询 mock_exams 表
- [x] SubTask 4.3: 检查前端是否正确处理 API 响应
- [x] SubTask 4.4: 修复 TypeError: Failed to fetch 错误
- [x] SubTask 4.5: 验证试卷列表正常显示

## Task 5: 修复个人页面统计数据实时更新
**Description**: 确保个人页面的已学单词、学习天数、准确率等数据实时更新。

- [x] SubTask 5.1: 检查 profile/page.tsx 中的统计数据获取逻辑
- [x] SubTask 5.2: 检查 auth-context.tsx 中的用户数据更新机制
- [x] SubTask 5.3: 确保学习完成后更新用户统计数据
- [x] SubTask 5.4: 添加数据刷新逻辑（如返回页面时重新获取）
- [x] SubTask 5.5: 验证统计数据正确更新

# Task Dependencies
- Task 2 和 Task 3 可以并行执行（都是练习相关）
- Task 1、Task 4、Task 5 相互独立
