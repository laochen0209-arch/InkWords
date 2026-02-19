# 修复登录、性能和数据同步问题 - The Implementation Plan (Decomposed and Prioritized Task List)

## [x] Task 1: 修复登录界面语言逻辑错误
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 修复app/auth/page.tsx中localStorage.clear()清除语言设置的问题
  - 只清除认证相关的localStorage项，保留语言设置
  - 让登录页面使用language-context来获取UI语言
- **Acceptance Criteria Addressed**: [AC-1]
- **Test Requirements**:
  - `programmatic` TR-1.1: 登录页面不清除inkwords_ui_language和inkwords_learning_mode
  - `human-judgement` TR-1.2: 登录页面显示正确的语言（默认英语）
- **Notes**: 关键是不要清除所有localStorage，只清除认证相关的

## [x] Task 2: 优化登录后进入/study界面的速度
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 分析auth-context和study页面的初始化逻辑
  - 优化登录跳转流程，减少不必要的等待
  - 确保登录成功后立即跳转，不需要等待完整用户资料加载
- **Acceptance Criteria Addressed**: [AC-2]
- **Test Requirements**:
  - `programmatic` TR-2.1: 登录到进入/study时间&lt;2秒
  - `human-judgement` TR-2.2: 用户感觉登录响应快速
- **Notes**: 可以先跳转再后台加载用户资料

## [x] Task 3: 修复所有7个考试模式的模拟试卷界面问题
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 检查MockContent.tsx的试卷加载逻辑
  - 验证所有7个考试模式（IELTS、TOEFL、CET-4、CET-6、HSK、BCT、TOCFL）的数据格式是否正确
  - 修复sections到questions的转换逻辑，确保所有模式都兼容
- **Acceptance Criteria Addressed**: [AC-3]
- **Test Requirements**:
  - `programmatic` TR-3.1: 所有7个考试模式的试卷都能正常加载
  - `human-judgement` TR-3.2: 所有模式的题目和内容都正确显示
- **Notes**: 重点检查数据格式兼容性，确保所有7个模式都能正常工作

## [x] Task 4: 修复用户学习数据不实时显示的问题
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 检查学习数据记录逻辑（recordStudy和logUserActivity）
  - 验证数据保存到数据库
  - 检查profile/dashboard页面的数据刷新机制
  - 添加数据刷新触发器
- **Acceptance Criteria Addressed**: [AC-4]
- **Test Requirements**:
  - `programmatic` TR-4.1: 学习后数据写入数据库
  - `programmatic` TR-4.2: 刷新页面后数据显示更新
  - `human-judgement` TR-4.3: 用户能看到最新学习统计
- **Notes**: 需要确保学习完成后触发数据刷新
