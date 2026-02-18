## 任务概述
创建用户数据中心页面，路径为 `/dashboard`，展示用户的学习数据统计。

## 已分析的代码结构
- 项目使用 Next.js + TypeScript + Tailwind CSS
- UI 组件库使用 Radix UI + 自定义组件
- 图表库: `recharts` (已安装)
- 动画库: `framer-motion`
- 图标库: `lucide-react`
- 项目已有 `app/home/page.tsx` 作为首页仪表盘

## 实施步骤

### 步骤 1: 创建 Dashboard 页面文件
**文件**: `app/dashboard/page.tsx`
- 主页面组件，整合所有子组件
- 从 Supabase 获取 user_activities 数据
- 使用水墨风格背景 (ink-landscape-bg)

### 步骤 2: 创建数据概览 Stat Cards 组件
**文件**: `app/dashboard/components/stat-cards.tsx`
- 累计学习天数: 统计有活动记录的不同日期数
- 已读文章数: 统计 action_type='read_article' 的记录数
- 累计考试次数: 统计 action_type='take_exam' 的记录数
- 掌握单词量: 统计 action_type='learn_word' 的记录数

### 步骤 3: 创建学习热力图组件
**文件**: `app/dashboard/components/activity-calendar.tsx`
- 显示过去 30 天的学习活跃度
- 基于 created_at 字段统计每天的活动数量
- 使用颜色深浅表示活跃度高低
- 类似 GitHub 贡献图样式

### 步骤 4: 创建近期动态 Timeline 组件
**文件**: `app/dashboard/components/recent-timeline.tsx`
- 列出最近 10 条活动记录
- 格式化显示相对时间 (如 "2分钟前")
- 根据活动类型显示不同图标和描述

### 步骤 5: 创建能力雷达图组件
**文件**: `app/dashboard/components/skill-radar.tsx`
- 使用 recharts 的 RadarChart
- 分析维度: Listening, Reading, Vocabulary
- 基于 take_exam 记录计算各维度平均分

### 步骤 6: 创建数据获取 Hook
**文件**: `app/dashboard/hooks/use-dashboard-data.ts`
- 封装 Supabase 查询逻辑
- 返回统计数据、活动记录、热力图数据

## 文件创建清单
1. `app/dashboard/page.tsx` - 主页面
2. `app/dashboard/components/stat-cards.tsx` - 数据概览卡片
3. `app/dashboard/components/activity-calendar.tsx` - 学习热力图
4. `app/dashboard/components/recent-timeline.tsx` - 近期动态
5. `app/dashboard/components/skill-radar.tsx` - 能力雷达图
6. `app/dashboard/hooks/use-dashboard-data.ts` - 数据获取 Hook

## 数据结构
从 user_activities 表查询:
- `action_type`: 'read_article' | 'take_exam' | 'learn_word'
- `target_id`: 目标ID
- `details`: JSONB 包含详细数据
- `created_at`: 活动时间

请确认此计划后，我将开始创建所有文件。