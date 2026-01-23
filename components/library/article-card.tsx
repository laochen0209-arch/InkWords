"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { useState } from "react"
import { NativeLang, TargetLang } from "@/lib/language-utils"

type WatermarkType = "bamboo" | "plum" | "orchid" | "chrysanthemum"

interface ArticleCardProps {
  id: string
  title: string
  titleEn?: string
  author: string
  excerpt: string
  excerptEn?: string
  isRead: boolean
  watermark: WatermarkType
  nativeLang?: NativeLang
  targetLang?: TargetLang
}

// 水印SVG组件 - 梅兰竹菊
function Watermark({ type, isActive }: { type: WatermarkType; isActive: boolean }) {
  const watermarks = {
    bamboo: (
      <svg viewBox="0 0 60 80" className="w-12 h-16 opacity-[0.15]">
        <path 
          d="M30 5 L30 75 M25 20 Q20 25 15 22 M35 35 Q40 40 45 37 M25 50 Q20 55 15 52 M35 65 Q40 70 45 67" 
          stroke="currentColor" 
          strokeWidth="2" 
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    ),
    plum: (
      <svg viewBox="0 0 60 60" className="w-12 h-12 opacity-[0.15]">
        <circle cx="30" cy="30" r="8" fill="currentColor" />
        <circle cx="18" cy="22" r="5" fill="currentColor" />
        <circle cx="42" cy="22" r="5" fill="currentColor" />
        <circle cx="20" cy="42" r="5" fill="currentColor" />
        <circle cx="40" cy="42" r="5" fill="currentColor" />
        <path d="M30 5 Q35 15 30 30" stroke="currentColor" strokeWidth="2" fill="none" />
      </svg>
    ),
    orchid: (
      <svg viewBox="0 0 60 80" className="w-12 h-16 opacity-[0.15]">
        <path 
          d="M30 75 Q25 50 30 30 Q35 15 25 5 M30 75 Q35 50 30 35 Q25 20 35 5 M30 75 Q20 55 15 40" 
          stroke="currentColor" 
          strokeWidth="2" 
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    ),
    chrysanthemum: (
      <svg viewBox="0 0 60 60" className="w-12 h-12 opacity-[0.15]">
        <circle cx="30" cy="30" r="6" fill="currentColor" />
        {[...Array(12)].map((_, i) => (
          <ellipse 
            key={i}
            cx="30" 
            cy="15" 
            rx="4" 
            ry="10" 
            fill="currentColor"
            transform={`rotate(${i * 30} 30 30)`}
          />
        ))}
      </svg>
    ),
  }
  
  return watermarks[type]
}

export function ArticleCard({ 
  id, 
  title, 
  titleEn,
  author, 
  excerpt, 
  excerptEn,
  isRead, 
  watermark,
  nativeLang = "zh",
  targetLang = "en"
}: ArticleCardProps) {
  const [isPressed, setIsPressed] = useState(false)
  
  /**
   * 根据目标语言决定显示内容
   * targetLang = "zh" 时，显示中文（学习中文）
   * targetLang = "en" 时，显示英文（学习英文）
   */
  const displayTitle = targetLang === "zh" ? title : (titleEn || title)
  const displayExcerpt = targetLang === "zh" ? excerpt : (excerptEn || excerpt)

  return (
    <Link 
      href={`/reader/${id}`}
      className="block"
      onClick={() => setIsPressed(true)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
    >
      <motion.article 
        className={cn(
          "relative bg-[#FDFBF7] border border-ink-gray/20",
          "overflow-hidden transition-all duration-300",
          "hover:border-ink-gray/40 active:scale-[0.99]"
        )}
        style={{ 
          boxShadow: isPressed 
            ? "0 0 0 4px rgba(194, 62, 50, 0.15), 0 0 0 2px rgba(194, 62, 50, 0.08), var(--shadow-ink)" 
            : "var(--shadow-ink)"
        }}
        whileTap={{ 
          scale: 0.97,
          borderColor: "#C23E32",
        }}
      >
        {/* 左侧装饰条 - 强制加粗并锁定为品牌印章红 */}
        <div 
          className={cn(
            "absolute left-0 top-0 bottom-0 transition-colors duration-300 z-10",
            "w-2.5 bg-[#C23E32]"
          )}
          aria-hidden="true"
        />
        
        {/* 右侧水印装饰 - 点击时变红 */}
        <div 
          className={cn(
            "absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-300 z-10",
            isPressed ? "text-[#C23E32]" : "text-ink-black"
          )}
          aria-hidden="true"
        >
          <Watermark type={watermark} isActive={isPressed} />
        </div>
        
        {/* 内容区 */}
        <div className="pl-6 pr-16 py-4 w-full">
          <div className="flex items-baseline gap-2 mb-2">
            <h3 className={cn(
              "font-serif text-base font-medium transition-colors duration-300 truncate",
              isPressed ? "text-[#C23E32]" : "text-ink-black"
            )}>
              {displayTitle}
            </h3>
            <span className="text-xs text-ink-gray">
              {author}
            </span>
          </div>
          
          <p className={cn(
            "text-sm leading-relaxed transition-colors duration-300 line-clamp-3",
            isPressed ? "text-[#C23E32]" : "text-ink-gray"
          )}>
            {displayExcerpt}
          </p>
        </div>
      </motion.article>
    </Link>
  )
}
