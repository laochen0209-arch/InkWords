/**
 * @file recent-timeline.tsx
 * @description 近期动态组件 - 显示用户最近的学习活动记录
 * @author InkWords Team
 * @date 2026-02-04
 */

'use client'

import { motion } from 'framer-motion'
import { BookOpen, FileText, Type, Activity } from 'lucide-react'
import {
  UserActivity,
  formatRelativeTime,
  getActivityDescription,
} from '../hooks/use-dashboard-data'

interface RecentTimelineProps {
  activities: UserActivity[]
}

/**
 * 图标映射
 */
const iconMap = {
  read_article: BookOpen,
  take_exam: FileText,
  learn_word: Type,
}

/**
 * 活动类型颜色映射
 */
const colorMap = {
  read_article: {
    bg: 'bg-[#2B7A99]/10',
    text: 'text-[#2B7A99]',
    border: 'border-[#2B7A99]/20',
  },
  take_exam: {
    bg: 'bg-[#E8A838]/10',
    text: 'text-[#E8A838]',
    border: 'border-[#E8A838]/20',
  },
  learn_word: {
    bg: 'bg-[#5A9A6E]/10',
    text: 'text-[#5A9A6E]',
    border: 'border-[#5A9A6E]/20',
  },
}

/**
 * 活动类型标签映射
 */
const labelMap = {
  read_article: '阅读',
  take_exam: '考试',
  learn_word: '单词',
}

/**
 * 单个时间线项目组件
 */
function TimelineItem({
  activity,
  index,
  isLast,
}: {
  activity: UserActivity
  index: number
  isLast: boolean
}) {
  const Icon = iconMap[activity.action_type] || Activity
  const colors = colorMap[activity.action_type] || {
    bg: 'bg-stone-100',
    text: 'text-stone-500',
    border: 'border-stone-200',
  }
  const label = labelMap[activity.action_type] || '活动'
  const description = getActivityDescription(activity)
  const relativeTime = formatRelativeTime(activity.created_at)

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.08,
        ease: [0.4, 0, 0.2, 1],
      }}
      className="relative flex gap-4"
    >
      {/* 时间线连接线 */}
      {!isLast && (
        <div className="absolute left-5 top-10 bottom-0 w-px bg-stone-200" />
      )}

      {/* 图标 */}
      <div
        className={`
          relative z-10 w-10 h-10 rounded-full ${colors.bg} 
          flex items-center justify-center flex-shrink-0
          border-2 ${colors.border}
        `}
      >
        <Icon className={`w-5 h-5 ${colors.text}`} strokeWidth={1.5} />
      </div>

      {/* 内容 */}
      <div className="flex-1 pb-6">
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-stone-200/50 hover:bg-white/80 transition-colors">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              {/* 标签 */}
              <span
                className={`
                  inline-block px-2 py-0.5 rounded-full text-xs font-medium
                  ${colors.bg} ${colors.text} mb-2
                `}
              >
                {label}
              </span>

              {/* 描述 */}
              <p className="text-sm text-stone-700 leading-relaxed">
                {description}
              </p>

              {/* 时间 */}
              <p className="text-xs text-stone-400 mt-2">{relativeTime}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/**
 * 空状态组件
 */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mb-4">
        <Activity className="w-8 h-8 text-stone-300" strokeWidth={1.5} />
      </div>
      <p className="text-stone-500 font-medium">暂无学习记录</p>
      <p className="text-sm text-stone-400 mt-1">开始你的学习之旅吧！</p>
    </div>
  )
}

/**
 * 近期动态组件
 */
export function RecentTimeline({ activities }: RecentTimelineProps) {
  const hasActivities = activities.length > 0

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-stone-200/50 rounded-2xl p-6 shadow-sm h-full">
      {/* 标题区域 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-stone-800 font-serif">
            近期动态
          </h3>
          <p className="text-sm text-stone-500 mt-1">最近的学习活动</p>
        </div>
        {hasActivities && (
          <span className="text-xs text-stone-400">
            共 {activities.length} 条记录
          </span>
        )}
      </div>

      {/* 时间线列表 */}
      {hasActivities ? (
        <div className="space-y-0 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
          {activities.map((activity, index) => (
            <TimelineItem
              key={activity.id}
              activity={activity}
              index={index}
              isLast={index === activities.length - 1}
            />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  )
}
