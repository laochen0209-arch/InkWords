# 修复多语言和练习中心问题 - The Implementation Plan (Decomposed and Prioritized Task List)

## [x] Task 1: 修复首页语言选择的逻辑
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 修复 app/page.tsx 中的 handleSelect 函数
  - 确保点击"中文"（学习中文）时，不仅设置 learningMode，还正确设置 nativeLang 和 targetLang
  - 应该调用语言上下文的 switchMode 函数来确保所有语言状态同步
- **Acceptance Criteria Addressed**: [AC-1]
- **Test Requirements**:
  - `programmatic` TR-1.1: 点击"中文"按钮后，localStorage 中的 inkwords_native_lang 应为 "en"
  - `programmatic` TR-1.2: 点击"中文"按钮后，localStorage 中的 inkwords_target_lang 应为 "zh"
  - `programmatic` TR-1.3: 点击"英文"按钮后，localStorage 中的 inkwords_native_lang 应为 "zh"
  - `programmatic` TR-1.4: 点击"英文"按钮后，localStorage 中的 inkwords_target_lang 应为 "en"
- **Notes**: 使用 language-context 中已有的 switchMode 函数，它已经包含了正确的逻辑

## [x] Task 2: 修复 profile 页面开通会员的语言逻辑
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 检查 app/profile/page.tsx 中的会员开通内容
  - 将硬编码的中文文本替换为根据语言模式动态显示的内容
  - 使用 TRANSLATIONS 对象或 uiLanguage 来判断显示语言
- **Acceptance Criteria Addressed**: [AC-2]
- **Test Requirements**:
  - `human-judgement` TR-2.1: 当 uiLanguage 为 "zh" 时，会员开通内容显示中文
  - `human-judgement` TR-2.2: 当 uiLanguage 为 "en" 时，会员开通内容显示英文
  - `programmatic` TR-2.3: 检查代码中没有硬编码的中文文本（除了必要的注释）
- **Notes**: 需要检查 TRANSLATIONS 对象中是否有相关的翻译键，如果没有需要添加

## [x] Task 3: 检查并修复备考中心试卷内容显示问题
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 检查 app/practice/PracticeContent.tsx 中的试卷数据获取逻辑
  - 检查 Supabase 数据库中 mock_exams 表的数据结构
  - 验证试卷类型的命名是否与数据库一致
  - 修复数据获取和显示的问题
- **Acceptance Criteria Addressed**: [AC-3]
- **Test Requirements**:
  - `programmatic` TR-3.1: 控制台能打印出获取到的试卷数据
  - `programmatic` TR-3.2: 页面能正常显示试卷列表（如果数据库有数据）
  - `programmatic` TR-3.3: 切换考试类型时能正确加载对应类型的试卷
  - `human-judgement` TR-3.4: 没有无限加载或错误提示
- **Notes**: 需要检查 mock_exams 表的 exam_type 字段值是否与前端定义的 EXAM_TYPES 一致

## [x] Task 4: 检查 mistake bank 和 exam papers 问题
- **Priority**: P1
- **Depends On**: None
- **Description**: 
  - 检查 practice 页面的 mistake bank 和 exam papers 功能
  - 查看相关组件的实现
  - 检查数据获取和显示逻辑
- **Acceptance Criteria Addressed**: [AC-4]
- **Test Requirements**:
  - `human-judgement` TR-4.1: mistake bank 功能可以正常访问
  - `human-judgement` TR-4.2: exam papers 功能可以正常访问
  - `programmatic` TR-4.3: 控制台没有相关错误
- **Notes**: 先查看 practice 页面的完整实现，找到相关的功能入口
