/**
 * @file skill-radar.tsx
 * @description 能力雷达图组件 - 使用 recharts 展示用户各项能力评分
 * @author InkWords Team
 * @date 2026-02-04
 */

'use client'

import { motion } from 'framer-motion'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { RadarData } from '../hooks/use-dashboard-data'
import { Target } from 'lucide-react'

interface SkillRadarProps {
  data: RadarData[]
}

/**
 * 自定义 Tooltip 组件
 */
function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ value: number; payload: RadarData }>
}) {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white/95 backdrop-blur-sm border border-stone-200 rounded-lg p-3 shadow-lg">
        <p className="font-medium text-stone-800">{data.subject}</p>
        <p className="text-sm text-[#C23E32] font-semibold">
          得分: {data.score} / {data.fullMark}
        </p>
      </div>
    )
  }
  return null
}

/**
 * 空状态组件
 */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-[300px] text-center">
      <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mb-4">
        <Target className="w-8 h-8 text-stone-300" strokeWidth={1.5} />
      </div>
      <p className="text-stone-500 font-medium">暂无能力数据</p>
      <p className="text-sm text-stone-400 mt-1">完成更多练习来生成能力分析</p>
    </div>
  )
}

/**
 * 能力雷达图组件
 */
export function SkillRadar({ data }: SkillRadarProps) {
  // 检查是否有有效数据（至少有一个非零分数）
  const hasValidData = data.some((item) => item.score > 0)

  // 计算平均分
  const averageScore = hasValidData
    ? Math.round(
        data.filter((item) => item.score > 0).reduce((sum, item) => sum + item.score, 0) /
          data.filter((item) => item.score > 0).length
      )
    : 0

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-stone-200/50 rounded-2xl p-6 shadow-sm">
      {/* 标题区域 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-stone-800 font-serif">
            能力雷达图
          </h3>
          <p className="text-sm text-stone-500 mt-1">各项能力综合评估</p>
        </div>
        {hasValidData && (
          <div className="text-right">
            <p className="text-2xl font-bold text-[#C23E32] font-serif">
              {averageScore}
            </p>
            <p className="text-xs text-stone-500">平均分</p>
          </div>
        )}
      </div>

      {/* 雷达图 */}
      {hasValidData ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
              <PolarGrid
                stroke="#e5e5e5"
                radialLines={true}
              />
              <PolarAngleAxis
                dataKey="subject"
                tick={{
                  fill: '#78716c',
                  fontSize: 12,
                  fontWeight: 500,
                }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{
                  fill: '#a8a29e',
                  fontSize: 10,
                }}
                tickCount={6}
                stroke="#e5e5e5"
              />
              <Radar
                name="能力评分"
                dataKey="score"
                stroke="#C23E32"
                strokeWidth={2}
                fill="#C23E32"
                fillOpacity={0.2}
              />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      ) : (
        <EmptyState />
      )}

      {/* 能力详情 */}
      {hasValidData && (
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-stone-100">
          {data.map((item, index) => (
            <motion.div
              key={item.subject}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: 0.3 + index * 0.1,
                ease: [0.4, 0, 0.2, 1],
              }}
              className="text-center"
            >
              <p className="text-xs text-stone-500 mb-1">{item.subject}</p>
              <div className="flex items-baseline justify-center gap-0.5">
                <span
                  className={`text-xl font-bold font-serif ${
                    item.score >= 80
                      ? 'text-[#5A9A6E]'
                      : item.score >= 60
                      ? 'text-[#E8A838]'
                      : 'text-[#C23E32]'
                  }`}
                >
                  {item.score}
                </span>
                <span className="text-xs text-stone-400">/100</span>
              </div>
              {/* 进度条 */}
              <div className="mt-2 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.score}%` }}
                  transition={{
                    duration: 0.8,
                    delay: 0.5 + index * 0.1,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                  className={`h-full rounded-full ${
                    item.score >= 80
                      ? 'bg-[#5A9A6E]'
                      : item.score >= 60
                      ? 'bg-[#E8A838]'
                      : 'bg-[#C23E32]'
                  }`}
                />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
