"use client"

import { useState } from "react"
import { ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

export function ReaderHeader() {
  const [language, setLanguage] = useState<"zh" | "en">("zh")
  
  return (
    <header 
      className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#FDFBF7]/80 backdrop-blur-md border-b border-ink-gray/10"
    >
      <div className="max-w-2xl mx-auto h-full px-4 flex items-center justify-between">
        {/* 左侧返回按钮 */}
        <Link
          href="/"
          className="w-10 h-10 flex items-center justify-center rounded-full text-ink-gray hover:text-ink-black hover:bg-ink-gray/10 transition-all duration-200"
          aria-label="返回"
        >
          <ChevronLeft className="w-6 h-6" />
        </Link>
        
        {/* 右侧中英切换开关 */}
        <div 
          className="flex items-center h-8 border border-ink-gray/30 rounded-full overflow-hidden"
          role="tablist"
          aria-label="语言切换"
        >
          <button
            type="button"
            role="tab"
            aria-selected={language === "zh"}
            onClick={() => setLanguage("zh")}
            className={cn(
              "px-4 h-full text-sm font-medium transition-all duration-200",
              language === "zh" 
                ? "bg-ink-vermilion/10 text-ink-vermilion" 
                : "text-ink-gray hover:text-ink-black"
            )}
          >
            中
          </button>
          <div className="w-px h-4 bg-ink-gray/30" />
          <button
            type="button"
            role="tab"
            aria-selected={language === "en"}
            onClick={() => setLanguage("en")}
            className={cn(
              "px-4 h-full text-sm font-medium transition-all duration-200",
              language === "en" 
                ? "bg-ink-vermilion/10 text-ink-vermilion" 
                : "text-ink-gray hover:text-ink-black"
            )}
          >
            英
          </button>
        </div>
      </div>
    </header>
  )
}
