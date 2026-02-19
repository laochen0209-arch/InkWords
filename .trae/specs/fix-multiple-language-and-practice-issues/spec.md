# 修复多语言和练习中心问题 - Product Requirement Document

## Overview
- **Summary**: 修复墨语学习平台中的4个关键问题：1) 点击学习中文后母语显示错误；2) profile页面开通会员的语言逻辑；3) 备考中心/ practice页面试卷内容无法正常显示；4) 检查 mistake bank 和 exam papers 的问题。
- **Purpose**: 解决用户在语言选择、会员开通和练习中心使用过程中遇到的功能障碍，提升用户体验。
- **Target Users**: 墨语学习平台的所有用户，特别是使用学习中文模式的用户和练习中心的用户。

## Goals
- 修复点击学习中文后母语显示错误的问题
- 修复profile页面开通会员的语言逻辑
- 修复备考中心试卷内容无法正常显示的问题
- 检查并修复mistake bank和exam papers的问题

## Non-Goals (Out of Scope)
- 不涉及大规模代码重构
- 不添加新功能
- 不修改UI设计（除非是为了修复语言显示问题）

## Background & Context
通过代码检查发现：
1. 首页的语言选择功能只设置了learningMode，但没有正确设置nativeLang和targetLang
2. profile页面的会员开通内容是硬编码的中文，没有根据语言模式切换
3. practice页面有复杂的数据获取逻辑，可能存在试卷数据获取问题
4. 需要检查相关页面的完整实现

## Functional Requirements
- **FR-1**: 点击"学习中文"后，正确设置母语为英文，目标语言为中文
- **FR-2**: profile页面的开通会员内容根据当前语言模式动态显示
- **FR-3**: 备考中心能够正常从数据库获取并显示试卷内容
- **FR-4**: mistake bank和exam papers功能正常工作

## Non-Functional Requirements
- **NFR-1**: 修复后语言逻辑必须一致，所有页面语言行为统一
- **NFR-2**: 数据获取必须稳定可靠，避免无限加载或错误
- **NFR-3**: 所有修复必须不破坏现有功能

## Constraints
- **Technical**: 使用现有React/Next.js技术栈，使用Supabase作为后端
- **Business**: 保持现有UI风格不变
- **Dependencies**: 依赖现有的language-context和auth-context

## Assumptions
- Supabase数据库中有mock_exams表且有数据
- 现有的语言上下文机制是正确的
- 现有用户数据结构保持不变

## Acceptance Criteria

### AC-1: 修复点击学习中文后的母语设置
- **Given**: 用户在首页
- **When**: 用户点击"中文"（学习中文）按钮
- **Then**: 系统正确设置nativeLang为"en"，targetLang为"zh"，learningMode为"LEARN_CHINESE"
- **Verification**: `programmatic`
- **Notes**: 可以通过检查localStorage或页面行为验证

### AC-2: 修复profile页面开通会员的语言逻辑
- **Given**: 用户在/profile页面且不是VIP
- **When**: 语言模式切换
- **Then**: 开通会员区域的内容根据当前语言模式正确显示
- **Verification**: `human-judgment`

### AC-3: 备考中心正常显示试卷内容
- **Given**: 用户在/practice页面
- **When**: 选择任意考试类型
- **Then**: 试卷列表正常显示，能看到试卷标题和描述
- **Verification**: `programmatic`

### AC-4: mistake bank和exam papers正常工作
- **Given**: 用户在/practice页面
- **When**: 访问mistake bank和exam papers功能
- **Then**: 功能正常，数据正确显示
- **Verification**: `human-judgment`

## Open Questions
- 无
