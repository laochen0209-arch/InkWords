"use client"

import { useState } from "react"
import { TopNav } from "@/components/dashboard/top-nav"
import { CheckInSeal } from "@/components/dashboard/check-in-seal"
import { FeatureCards } from "@/components/dashboard/feature-cards"
import { BottomNav } from "@/components/dashboard/bottom-nav"

type TabId = "study" | "library" | "profile"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabId>("study")
  const [points, setPoints] = useState(320)
  
  const handleCheckIn = () => {
    // 签到奖励积分
    setPoints(prev => prev + 10)
  }
  
  return (
    <main className="min-h-screen bg-ink-paper ink-landscape-bg">
      {/* 固定背景层 - 水墨山水 */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none"
        aria-hidden="true"
      >
        {/* 背景图由 ink-landscape-bg 的 ::before 伪元素提供 */}
      </div>
      
      {/* 顶部导航栏 */}
      <TopNav points={points} />
      
      {/* 主内容区 - 可滚动，上下留出固定栏的空间 */}
      <div className="relative z-10 pt-20 pb-28 px-6 min-h-screen overflow-y-auto">
        {/* 核心签到区 */}
        <section className="flex flex-col items-center justify-center py-12">
          <CheckInSeal onCheckIn={handleCheckIn} />
        </section>
        
        {/* 功能入口卡片 */}
        <section className="flex justify-center">
          <FeatureCards 
            dailyProgress={12}
            dailyTotal={20}
            articleTitle="唐诗中的色彩美学：从「春风又绿江南岸」说起"
          />
        </section>
        
        {/* 可扩展的更多内容区域 */}
        <section className="mt-8 flex flex-col items-center">
          <div className="w-full max-w-md">
            {/* 学习统计概览 */}
            <div className="p-4 bg-ink-paper/80 border border-border rounded-lg">
              <h3 className="font-serif text-sm font-medium text-ink-black mb-3">本周学习</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-semibold text-ink-black">56</p>
                  <p className="text-xs text-ink-gray">新词</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-ink-vermilion">89%</p>
                  <p className="text-xs text-ink-gray">正确率</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-ink-bamboo">7</p>
                  <p className="text-xs text-ink-gray">连续天</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      
      {/* 底部导航栏 */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </main>
  )
}
