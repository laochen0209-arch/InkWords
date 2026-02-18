/**
 * @file activity-calendar.tsx
 * @description 学习热力图组件 - 显示用户过去30天的学习活跃度
 * @author InkWords Team
 * @date 2026-02-04
 */

'use client'

import { motion } from 'framer-motion'
import { HeatmapData } from '../hooks/use-dashboard-data'

interface ActivityCalendarProps {
  data: HeatmapData[]
}

/**
 * 获取活跃度颜色级别
 * @param count 活动数量
 * @returns 颜色级别类名
 */
function getActivityLevel(count: number): string {
  if (count === 0) return 'bg-stone-100'
  if (count === 1) return 'bg-[#C23E32]/20'
  if (count <= 3) return 'bg-[#C23E32]/40'
  if (count <= 5) return 'bg-[#C23E32]/60'
  return 'bg-[#C23E32]'
}

/**
 * 获取活跃度标签
 * @param count 活动数量
 * @returns 活跃度描述
 */
function getActivityLabel(count: number): string {
  if (count === 0) return '无活动'
  if (count === 1) return '1 个活动'
  return `${count} 个活动`
}

/**
 * 格式化日期显示
 * @param dateStr 日期字符串 (YYYY-MM-DD)
 * @returns 格式化后的日期
 */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  const weekday = weekdays[date.getDay()]
  return `${month}月${day}日 周${weekday}`
}

/**
 * 学习热力图组件
 */
export function ActivityCalendar({ data }: ActivityCalendarProps) {
  // 计算统计数据
  const totalActivities = data.reduce((sum, d) => sum + d.count, 0)
  const activeDays = data.filter((d) => d.count > 0).length
  const maxActivitiesInDay = Math.max(...data.map((d) => d.count))
  const averageActivities = activeDays > 0 ? (totalActivities / activeDays).toFixed(1) : '0'

  // 将数据分成5行（每周7天，共显示30天）
  const weeks: HeatmapData[][] = []
  for (let i = 0; i < data.length; i += 7) {
    weeks.push(data.slice(i, i + 7))
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-stone-200/50 rounded-2xl p-6 shadow-sm">
      {/* 标题区域 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-stone-800 font-serif">
            学习热力图
          </h3>
          <p className="text-sm text-stone-500 mt-1">
            过去 30 天的学习活跃度
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-[#C23E32] font-serif">
            {activeDays}
          </p>
          <p className="text-xs text-stone-500">活跃天数</p>
        </div>
      </div>

      {/* 热力图网格 */}
      <div className="space-y-2">
        {/* 星期标签 */}
        <div className="flex gap-1">
          <div className="w-8" /> {/* 占位 */}
          {['一', '二', '三', '四', '五', '六', '日'].map((day) => (
            <div
              key={day}
              className="flex-1 text-center text-xs text-stone-400 font-medium"
            >
              {day}
            </div>
          ))}
        </div>

        {/* 热力图 */}
        <div className="flex gap-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex-1 flex flex-col gap-1">
              {week.map((day, dayIndex) => (
                <motion.div
                  key={day.date}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    duration: 0.3,
                    delay: (weekIndex * 7 + dayIndex) * 0.01,
                    ease: 'backOut',
                  }}
                  whileHover={{ scale: 1.2, zIndex: 10 }}
                  className={`
                    aspect-square rounded-md cursor-pointer
                    transition-all duration-200
                    ${getActivityLevel(day.count)}
                    hover:ring-2 hover:ring-[#C23E32]/50
                  `}
                  title={`${formatDate(day.date)}: ${getActivityLabel(day.count)}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* 图例 */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-stone-100">
        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-500">活跃度:</span>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-stone-100" />
            <span className="text-xs text-stone-400">0</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-[#C23E32]/20" />
            <span className="text-xs text-stone-400">1</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-[#C23E32]/40" />
            <span className="text-xs text-stone-400">2-3</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-[#C23E32]/60" />
            <span className="text-xs text-stone-400">4-5</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-[#C23E32]" />
            <span className="text-xs text-stone-400">6+</span>
          </div>
        </div>

        {/* 统计摘要 */}
        <div className="flex items-center gap-4 text-xs text-stone-500">
          <span>
            总计: <strong className="text-stone-700">{totalActivities}</strong> 活动
          </span>
          <span>
            日均: <strong className="text-stone-700">{averageActivities}</strong> 活动
          </span>
          {maxActivitiesInDay > 0 && (
            <span>
              最高: <strong className="text-stone-700">{maxActivitiesInDay}</strong> 活动/天
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
