"use client"

import { cn } from "@/lib/utils"

type WatermarkType = "bamboo" | "plum" | "orchid" | "chrysanthemum"

interface ArticleCardProps {
  id: string
  title: string
  author: string
  excerpt: string
  isRead: boolean
  watermark: WatermarkType
}

// 水印SVG组件 - 梅兰竹菊
function Watermark({ type }: { type: WatermarkType }) {
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
  title, 
  author, 
  excerpt, 
  isRead, 
  watermark 
}: ArticleCardProps) {
  return (
    <article 
      className={cn(
        "relative bg-ink-paper border border-ink-gray/20",
        "overflow-hidden transition-all duration-300",
        "hover:border-ink-gray/40 active:scale-[0.99]",
        "cursor-pointer"
      )}
      style={{ boxShadow: "var(--shadow-ink)" }}
    >
      {/* 左侧状态条 */}
      <div 
        className={cn(
          "absolute left-0 top-0 bottom-0 w-1.5",
          isRead ? "bg-ink-gray/40" : "bg-ink-vermilion"
        )}
        aria-hidden="true"
      />
      
      {/* 右侧水印装饰 */}
      <div 
        className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-black pointer-events-none"
        aria-hidden="true"
      >
        <Watermark type={watermark} />
      </div>
      
      {/* 内容区 */}
      <div className="pl-5 pr-16 py-4">
        {/* 标题与作者 */}
        <div className="flex items-baseline gap-2 mb-2">
          <h3 className="font-serif text-base text-ink-black font-medium">
            {title}
          </h3>
          <span className="text-xs text-ink-gray">
            {author}
          </span>
        </div>
        
        {/* 摘要 */}
        <p className="text-sm text-ink-gray leading-relaxed line-clamp-2">
          {excerpt}
        </p>
      </div>
    </article>
  )
}
