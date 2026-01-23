"use client"

import { BookOpen, GraduationCap } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"

interface FeatureCardsProps {
  dailyProgress?: number
  dailyTotal?: number
  articleTitle?: string
}

export function FeatureCards({ 
  dailyProgress = 12, 
  dailyTotal = 20,
  articleTitle = "唐诗中的色彩美学"
}: FeatureCardsProps) {
  const progressPercent = (dailyProgress / dailyTotal) * 100
  
  return (
    <div className="grid grid-cols-2 gap-4 w-full max-w-md">
      {/* 每日修习卡片 */}
      <Link 
        href="/"
        className="group flex flex-col p-4 bg-ink-paper border border-border rounded-lg shadow-[var(--shadow-ink)] hover:shadow-[var(--shadow-ink-hover)] transition-shadow"
      >
        {/* 图标 */}
        <div className="w-10 h-10 flex items-center justify-center bg-ink-vermilion/10 rounded-full mb-3">
          <GraduationCap className="w-5 h-5 text-ink-vermilion" />
        </div>
        
        {/* 标题 */}
        <h3 className="font-serif text-base font-medium text-ink-black mb-1">
          每日修习
        </h3>
        
        {/* 进度信息 */}
        <p className="text-xs text-ink-gray mb-2">
          今日进度 {dailyProgress}/{dailyTotal}
        </p>
        
        {/* 进度条 */}
        <Progress 
          value={progressPercent} 
          className="h-1.5 bg-border"
        />
        
        {/* 开始按钮 */}
        <div className="mt-3 pt-3 border-t border-border">
          <span className="text-sm text-ink-vermilion font-medium group-hover:underline">
            继续学习
          </span>
        </div>
      </Link>
      
      {/* 每日精选卡片 */}
      <div className="group flex flex-col p-4 bg-ink-paper border border-border rounded-lg shadow-[var(--shadow-ink)] hover:shadow-[var(--shadow-ink-hover)] transition-shadow cursor-pointer">
        {/* 图标 */}
        <div className="w-10 h-10 flex items-center justify-center bg-ink-bamboo/10 rounded-full mb-3">
          <BookOpen className="w-5 h-5 text-ink-bamboo" />
        </div>
        
        {/* 标题 */}
        <h3 className="font-serif text-base font-medium text-ink-black mb-1">
          每日精选
        </h3>
        
        {/* 文章标题 */}
        <p className="text-xs text-ink-gray line-clamp-2 flex-1">
          {articleTitle}
        </p>
        
        {/* 阅读按钮 */}
        <div className="mt-3 pt-3 border-t border-border">
          <span className="text-sm text-ink-bamboo font-medium group-hover:underline">
            开始阅读
          </span>
        </div>
      </div>
    </div>
  )
}
