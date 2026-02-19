# 修复登录、性能和数据同步问题 - Product Requirement Document

## Overview
- **Summary**: 修复4个关键问题：登录界面语言逻辑错误、登录后进入/study界面缓慢、CET-6模拟试卷界面问题、用户学习数据不实时显示
- **Purpose**: 解决用户反馈的关键体验问题，确保系统功能正常运行
- **Target Users**: 所有网站用户

## Goals
- 修复登录界面语言显示错误，正确显示英语界面
- 优化登录后进入/study页面的加载速度
- 修复所有7个考试模式（IELTS、TOEFL、CET-4、CET-6、HSK、BCT、TOCFL）的模拟试卷界面显示问题
- 确保用户学习数据能实时同步到数据库并在前端显示

## Non-Goals (Out of Scope)
- 不重构整个架构
- 不添加新功能
- 不修改数据库表结构

## Background & Context
通过代码分析发现以下问题：
1. 登录页面使用localStorage.clear()清除所有语言设置
2. 登录流程中存在多个异步操作可能导致延迟
3. 所有7个考试模式（IELTS、TOEFL、CET-4、CET-6、HSK、BCT、TOCFL）的模拟试卷数据获取逻辑需要检查
4. 用户学习数据记录和刷新机制需要验证

## Functional Requirements
- **FR-1**: 登录页面正确显示用户设置的语言（默认英语）
- **FR-2**: 登录后2秒内进入/study页面
- **FR-3**: 所有7个考试模式（IELTS、TOEFL、CET-4、CET-6、HSK、BCT、TOCFL）的模拟试卷正常显示题目和内容
- **FR-4**: 用户学习数据实时保存到数据库并在前端刷新显示

## Non-Functional Requirements
- **NFR-1**: 登录到进入/study页面时间 &lt; 2秒
- **NFR-2**: 语言状态在所有页面保持一致
- **NFR-3**: 数据同步延迟 &lt; 1秒

## Constraints
- **Technical**: 使用现有的React/Next.js和Supabase架构
- **Business**: 不影响现有功能
- **Dependencies**: 依赖现有的language-context和auth-context

## Assumptions
- 用户浏览器支持localStorage
- Supabase服务正常运行
- 网络连接正常

## Acceptance Criteria

### AC-1: 登录界面语言正确显示
- **Given**: 用户已设置UI语言为英语
- **When**: 访问登录页面
- **Then**: 登录页面显示英语界面
- **Verification**: `human-judgment`

### AC-2: 登录后快速进入/study
- **Given**: 用户输入正确的登录信息
- **When**: 点击登录按钮
- **Then**: 在2秒内跳转到/study页面
- **Verification**: `programmatic`

### AC-3: 所有7个考试模式的模拟试卷正常显示
- **Given**: 选择任意一个考试模式（IELTS、TOEFL、CET-4、CET-6、HSK、BCT、TOCFL）
- **When**: 页面加载完成
- **Then**: 试卷题目和内容正常显示
- **Verification**: `human-judgment`

### AC-4: 学习数据实时显示
- **Given**: 用户完成单词或试卷学习
- **When**: 查看学习数据页面
- **Then**: 最新的学习数据显示在页面上
- **Verification**: `programmatic`

## Open Questions
- 无
