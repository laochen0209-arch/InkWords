"use client"

import React from "react"

import { X, BookOpen, Library, Sparkles, Award } from "lucide-react"
import Link from "next/link"

export default function SubscriptionPage() {
  return (
    <>
      {/* Layer 1: 固定背景层 - 水墨山水 + 暗黑叠加 */}
      <div 
        className="fixed inset-0 z-0"
        aria-hidden="true"
      >
        {/* 水墨山水背景图 */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{ backgroundImage: "url('/images/ink-landscape-bg.jpg')" }}
        />
        {/* 深黑色半透明叠加层 */}
        <div className="absolute inset-0 bg-black/85" />
      </div>
      
      {/* Layer 2: 可滚动内容区 */}
      <main className="relative z-10 min-h-screen overflow-y-auto">
        {/* 顶部关闭按钮 - 增加上边距避开手机状态栏 */}
        <div className="fixed top-0 left-0 right-0 z-40 pt-12 px-4 pb-4">
          <Link
            href="/profile"
            className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm text-[#FDFBF7] hover:bg-white/20 transition-colors duration-200"
            aria-label="关闭"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </Link>
        </div>
        
        {/* 内容区 - pb-32 避开底部支付栏 */}
        <div className="pt-20 pb-32 px-4">
          {/* 居中限制容器 */}
          <div className="w-full max-w-md mx-auto">
            
            {/* 核心卡片 - 玉牌/墨锭形状 */}
            <div className="relative mx-auto w-48 h-72 bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] border border-[#3a3a3a] shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)]">
              {/* 顶部装饰孔 */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full border-2 border-[#4a4a4a] bg-[#0a0a0a]" />
              
              {/* 边框光泽效果 */}
              <div className="absolute inset-[3px] border border-[#2a2a2a]" />
              
              {/* 竖排文字 - 副标题 */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
                <div className="writing-vertical font-serif text-[#FDFBF7]/70 text-base tracking-[0.3em] drop-shadow-[0_0_4px_rgba(212,175,55,0.2)]">
                  墨语
                </div>
                <div className="writing-vertical font-serif text-[#FDFBF7]/50 text-sm tracking-[0.2em] mt-2">
                  会员
                </div>
              </div>
              
              {/* 底部金色装饰线 */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-12 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-transparent" />
            </div>
            
            {/* 价格区域 - 巨大金色价格 */}
            <div className="mt-8 text-center">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-[#D4AF37] text-2xl font-serif font-medium">¥</span>
                <span className="text-[#D4AF37] text-7xl font-serif font-bold drop-shadow-[0_0_20px_rgba(212,175,55,0.5)]">2.98</span>
                <span className="text-[#FDFBF7]/50 text-base font-serif ml-1">/ 月</span>
              </div>
              <p className="mt-3 text-[#FDFBF7]/40 text-xs font-serif">首月特惠，随时可取消</p>
            </div>
            
            {/* 权益网格 - 增加顶部间距 */}
            <div className="mt-14 grid grid-cols-2 gap-4">
              <BenefitCard 
                icon={<BookOpen className="w-6 h-6" strokeWidth={1} />}
                title="无限词库"
                description="解锁全部精选词汇"
              />
              <BenefitCard 
                icon={<Library className="w-6 h-6" strokeWidth={1} />}
                title="畅读文库"
                description="海量双语美文"
              />
              <BenefitCard 
                icon={<Sparkles className="w-6 h-6" strokeWidth={1} />}
                title="纯净无扰"
                description="无广告沉浸体验"
              />
              <BenefitCard 
                icon={<Award className="w-6 h-6" strokeWidth={1} />}
                title="专属徽章"
                description="彰显尊贵身份"
              />
            </div>
            
            {/* 底部说明 */}
            <p className="mt-8 text-center text-[#FDFBF7]/30 text-xs font-serif">
              开通即表示同意《会员服务协议》
            </p>
            
          </div>
        </div>
      </main>
      
      {/* Layer 3: 固定底部支付栏 */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-t border-white/5">
        <div className="w-full max-w-md mx-auto px-4 py-4">
          <button
            type="button"
            className="relative w-full h-14 bg-gradient-to-r from-[#C9A227] via-[#F4D03F] to-[#C9A227] text-[#1a1a1a] font-serif font-semibold text-lg overflow-hidden group shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:shadow-[0_0_30px_rgba(212,175,55,0.6)] transition-shadow duration-300"
          >
            {/* 光泽扫过动画层 */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_ease-in-out_infinite]" />
            <span className="relative z-10 drop-shadow-[0_1px_1px_rgba(0,0,0,0.1)]">立即开通</span>
          </button>
        </div>
      </div>
    </>
  )
}

// 权益卡片组件
function BenefitCard({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode
  title: string
  description: string 
}) {
  return (
    <div className="flex flex-col items-center p-4 bg-white/5 border border-white/10">
      <div className="text-[#D4AF37]">
        {icon}
      </div>
      <h3 className="mt-3 text-[#FDFBF7] text-sm font-serif font-medium">
        {title}
      </h3>
      <p className="mt-1 text-[#FDFBF7]/50 text-xs font-serif">
        {description}
      </p>
    </div>
  )
}
