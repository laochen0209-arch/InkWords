"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface CheckInSealProps {
  onCheckIn?: () => void
  initialCheckedIn?: boolean
}

export function CheckInSeal({ onCheckIn, initialCheckedIn = false }: CheckInSealProps) {
  const [isCheckedIn, setIsCheckedIn] = useState(initialCheckedIn)
  const [isAnimating, setIsAnimating] = useState(false)
  
  const handleCheckIn = () => {
    if (isCheckedIn) return
    
    setIsAnimating(true)
    
    // 盖章动画
    setTimeout(() => {
      setIsCheckedIn(true)
      setIsAnimating(false)
      onCheckIn?.()
    }, 300)
  }
  
  return (
    <div className="flex flex-col items-center gap-4">
      {/* 签到提示文字 */}
      <p className="text-sm text-ink-gray font-serif">
        {isCheckedIn ? "今日已签到" : "点击印章完成签到"}
      </p>
      
      {/* 印章容器 */}
      <button
        type="button"
        onClick={handleCheckIn}
        disabled={isCheckedIn}
        className={cn(
          "relative w-32 h-32 md:w-40 md:h-40 flex items-center justify-center",
          "transition-all duration-300 ease-out",
          isCheckedIn 
            ? "cursor-default" 
            : "cursor-pointer hover:scale-105 active:scale-95",
          isAnimating && "animate-stamp"
        )}
        aria-label={isCheckedIn ? "今日已签到" : "点击签到"}
      >
        {/* 印章边框 */}
        <div 
          className={cn(
            "absolute inset-0 border-[3px] transition-all duration-300",
            isCheckedIn 
              ? "border-ink-vermilion bg-ink-vermilion/5" 
              : "border-dashed border-ink-gray/40 bg-transparent"
          )}
          style={{ borderRadius: '4px' }}
        />
        
        {/* 印章内容 */}
        <div className="relative z-10 flex flex-col items-center justify-center">
          {isCheckedIn ? (
            <>
              {/* 已签到状态 - 篆体风格 */}
              <span 
                className="font-serif text-3xl md:text-4xl font-bold text-ink-vermilion tracking-widest"
                style={{ 
                  textShadow: '1px 1px 0 rgba(194, 62, 50, 0.3)',
                }}
              >
                已签
              </span>
              {/* 装饰性小点 */}
              <div className="flex gap-1 mt-2">
                <span className="w-1 h-1 bg-ink-vermilion rounded-full opacity-60" />
                <span className="w-1 h-1 bg-ink-vermilion rounded-full opacity-80" />
                <span className="w-1 h-1 bg-ink-vermilion rounded-full opacity-60" />
              </div>
            </>
          ) : (
            <>
              {/* 未签到状态 */}
              <span className="font-serif text-2xl md:text-3xl text-ink-gray/50 tracking-widest">
                今日
              </span>
              <span className="font-serif text-lg md:text-xl text-ink-gray/40 mt-1">
                未签
              </span>
            </>
          )}
        </div>
        
        {/* 印章角落装饰 */}
        {isCheckedIn && (
          <>
            <span className="absolute top-1 left-1 w-2 h-2 border-t-2 border-l-2 border-ink-vermilion/60" />
            <span className="absolute top-1 right-1 w-2 h-2 border-t-2 border-r-2 border-ink-vermilion/60" />
            <span className="absolute bottom-1 left-1 w-2 h-2 border-b-2 border-l-2 border-ink-vermilion/60" />
            <span className="absolute bottom-1 right-1 w-2 h-2 border-b-2 border-r-2 border-ink-vermilion/60" />
          </>
        )}
      </button>
      
      {/* 连续签到天数 */}
      <p className="text-xs text-ink-gray">
        {isCheckedIn ? "连续签到 7 天" : "坚持签到，积累墨点"}
      </p>
    </div>
  )
}
