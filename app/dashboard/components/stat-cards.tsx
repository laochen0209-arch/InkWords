/**
 * @file stat-cards.tsx
 * @description 数据概览卡片组件 - 展示用户学习统计数据
 * @author InkWords Team
 * @date 2026-02-04
 */

'use client'

import { motion } from 'framer-motion'
import { Calendar, BookOpen, FileText, Type } from 'lucide-react'
import { DashboardStats } from '../hooks/use-dashboard-data'

interface StatCardsProps {
  stats: DashboardStats
}

/**
 * 统计卡片配置
 */
const statConfig = [
  {
    key: 'totalStudyDays' as const,
    label: '累计学习天数',
    icon: Calendar,
    color: 'from-[#C23E32] to-[#A8352B]',
    bgColor: 'bg-[#C23E32]/10',
    textColor: 'text-[#C23E32]',
  },
  {
    key: 'totalArticlesRead' as const,
    label: '已读文章数',
    icon: BookOpen,
    color: 'from-[#2B7A99] to-[#1E5A73]',
    bgColor: 'bg-[#2B7A99]/10',
    textColor: 'text-[#2B7A99]',
  },
  {
    key: 'totalExamsTaken' as const,
    label: '累计考试次数',
    icon: FileText,
    color: 'from-[#E8A838] to-[#D4952F]',
    bgColor: 'bg-[#E8A838]/10',
    textColor: 'text-[#E8A838]',
  },
  {
    key: 'totalWordsMastered' as const,
    label: '掌握单词量',
    icon: Type,
    color: 'from-[#5A9A6E] to-[#4A8260]',
    bgColor: 'bg-[#5A9A6E]/10',
    textColor: 'text-[#5A9A6E]',
  },
]

/**
 * 单个统计卡片组件
 */
function StatCard({
  value,
  label,
  icon: Icon,
  color,
  bgColor,
  textColor,
  index,
}: {
  value: number
  label: string
  icon: React.ElementType
  color: string
  bgColor: string
  textColor: string
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.4, 0, 0.2, 1],
      }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-sm border border-stone-200/50 p-6 shadow-sm hover:shadow-md transition-shadow"
    >
      {/* 背景渐变装饰 */}
      <div
        className={`absolute -right-4 -top-4 w-24 h-24 rounded-full bg-gradient-to-br ${color} opacity-10 blur-2xl`}
      />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-stone-500 mb-1">{label}</p>
          <motion.p
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              duration: 0.5,
              delay: index * 0.1 + 0.2,
              ease: 'backOut',
            }}
            className="text-3xl font-bold text-stone-800 font-serif"
          >
            {value.toLocaleString()}
          </motion.p>
        </div>

        <div
          className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center`}
        >
          <Icon className={`w-6 h-6 ${textColor}`} strokeWidth={1.5} />
        </div>
      </div>

      {/* 底部装饰线 */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${color} opacity-50`}
      />
    </motion.div>
  )
}

/**
 * 数据概览卡片组件
 */
export function StatCards({ stats }: StatCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statConfig.map((config, index) => (
        <StatCard
          key={config.key}
          value={stats[config.key]}
          label={config.label}
          icon={config.icon}
          color={config.color}
          bgColor={config.bgColor}
          textColor={config.textColor}
          index={index}
        />
      ))}
    </div>
  )
}
