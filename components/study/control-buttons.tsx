"use client"

import { cn } from "@/lib/utils"
import { Volume2, Check, X } from "lucide-react"

interface ControlButtonsProps {
  onUnknown: () => void
  onConfirm: () => void
  onKnown: () => void
  isPlaying?: boolean
  isLocked?: boolean
}

export function ControlButtons({ 
  onUnknown, 
  onConfirm, 
  onKnown,
  isPlaying = false,
  isLocked = false
}: ControlButtonsProps) {
  return (
    <div className="w-full py-6">
      <div className="flex items-end justify-center gap-6">
        {/* 左边：不认识 - 灰色边框小圆 */}
        <button
          type="button"
          onClick={onUnknown}
          className={cn(
            "w-14 h-14 rounded-full",
            "border border-ink-gray bg-transparent",
            "flex items-center justify-center",
            "transition-all duration-200",
            "hover:bg-ink-gray/10 active:scale-95"
          )}
          aria-label="不认识"
        >
          <X className="w-5 h-5 text-ink-gray" />
        </button>
        
        {/* 中间：播放/确认 - 朱砂红实心大圆 */}
        <button
          type="button"
          onClick={onConfirm}
          className={cn(
            "w-20 h-20 rounded-full",
            "bg-ink-vermilion text-ink-paper",
            "flex items-center justify-center",
            "transition-all duration-200",
            "hover:brightness-110 active:scale-95",
            isPlaying && "animate-pulse"
          )}
          style={{ boxShadow: '0 4px 20px rgba(194, 62, 50, 0.35)' }}
          aria-label="播放或确认"
        >
          <Volume2 className="w-7 h-7" />
        </button>
        
        {/* 右边：认识 - 竹青色边框小圆 */}
        <button
          type="button"
          onClick={onKnown}
          disabled={isLocked}
          className={cn(
            "w-14 h-14 rounded-full",
            "border border-ink-bamboo bg-transparent",
            "flex items-center justify-center",
            "transition-all duration-200",
            "hover:bg-ink-bamboo/10 active:scale-95",
            isLocked && "opacity-40 cursor-not-allowed hover:bg-transparent active:scale-100"
          )}
          aria-label="认识"
          aria-disabled={isLocked}
        >
          <Check className="w-5 h-5 text-ink-bamboo" />
        </button>
      </div>
    </div>
  )
}
