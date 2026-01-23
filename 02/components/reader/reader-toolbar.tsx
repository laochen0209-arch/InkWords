"use client"

import { BookmarkPlus, PlayCircle, Type } from "lucide-react"
import { Play } from "lucide-react" // Added import for Play

export function ReaderToolbar() {
  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 w-full h-16 bg-[#FDFBF7]/90 backdrop-blur-md border-t border-stone-100 rounded-none"
      role="toolbar"
      aria-label="阅读工具栏"
    >
      <div className="max-w-2xl mx-auto h-full px-4 flex items-center justify-between">
        {/* 左侧 - 加入生词本 */}
        <button
          type="button"
          className="flex flex-col items-center justify-center gap-1 w-20 h-full text-ink-gray hover:text-ink-black transition-colors duration-200"
          aria-label="加入生词本"
        >
          <BookmarkPlus className="w-5 h-5" strokeWidth={1.5} />
          <span className="text-xs">生词本</span>
        </button>
        
        {/* 中间 - 播放全文 */}
        <button
          type="button"
          className="flex items-center justify-center w-14 h-14 rounded-full bg-ink-vermilion hover:bg-ink-vermilion/90 transition-colors duration-200 shadow-md"
          aria-label="播放全文"
        >
          <Play className="w-6 h-6 text-white ml-1" fill="white" strokeWidth={0} />
        </button>
        
        {/* 右侧 - 字体设置 */}
        <button
          type="button"
          className="flex flex-col items-center justify-center gap-1 w-20 h-full text-ink-gray hover:text-ink-black transition-colors duration-200"
          aria-label="字体设置"
        >
          <Type className="w-5 h-5" strokeWidth={1.5} />
          <span className="text-xs">字体</span>
        </button>
      </div>
    </nav>
  )
}
