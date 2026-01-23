"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Search, X } from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"

// 历史搜索记录
const historyTags = [
  "Serendipity",
  "Petrichor", 
  "小王子",
  "Ephemeral",
  "山水",
]

// 热门修习
const trendingTags = [
  "Ephemeral",
  "Sonder",
  "春晓",
  "Luminescence",
  "Wanderlust",
  "岁月静好",
  "Mellifluous",
  "清风明月",
]

export default function SearchOverlay() {
  const [searchValue, setSearchValue] = useState("")
  const [isVisible, setIsVisible] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()

  // 入场动画
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50)
    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    setIsClosing(true)
    // 等待动画完成后可以进行路由跳转
    setTimeout(() => {
      router.back()
    }, 300)
  }

  const handleTagClick = (tag: string) => {
    setSearchValue(tag)
  }

  const handleClearHistory = () => {
    // 清除历史记录逻辑
  }

  return (
    <main 
      className={cn(
        "fixed inset-0 z-50",
        "min-h-screen",
        "ink-landscape-bg",
        "transition-all duration-300 ease-out",
        isVisible && !isClosing ? "opacity-100" : "opacity-0"
      )}
    >
      {/* 高浓度白色磨砂玻璃遮罩 */}
      <div 
        className={cn(
          "absolute inset-0",
          "bg-[#FDFBF7]/95 backdrop-blur-xl",
          "transition-all duration-300",
          isVisible && !isClosing ? "opacity-100" : "opacity-0"
        )}
      />

      {/* 主内容区 */}
      <div 
        className={cn(
          "relative z-10 min-h-screen",
          "flex flex-col",
          "px-6 pt-safe",
          "transition-all duration-300 ease-out",
          isVisible && !isClosing 
            ? "opacity-100 translate-y-0" 
            : "opacity-0 translate-y-4"
        )}
      >
        {/* 顶部搜索栏 */}
        <header className="pt-12 pb-8">
          <div className="flex items-center gap-4">
            {/* 搜索输入框 - 下划线风格 */}
            <div className="flex-1 relative flex items-center">
              {/* 搜索图标 */}
              <Search 
                className="absolute left-0 w-5 h-5 text-ink-gray/50" 
                strokeWidth={1.5}
              />
              
              {/* 输入框 */}
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="探寻万物之名..."
                autoFocus
                className={cn(
                  "w-full py-3 pl-8 pr-2",
                  "bg-transparent",
                  "border-0 border-b-2 border-stone-300",
                  "rounded-none",
                  "font-serif text-lg text-ink-black",
                  "placeholder:text-ink-gray/40 placeholder:font-serif",
                  "caret-[#C23E32]",
                  "transition-colors duration-300",
                  "focus:outline-none focus:border-ink-black"
                )}
              />

              {/* 清除按钮 */}
              {searchValue && (
                <button
                  type="button"
                  onClick={() => setSearchValue("")}
                  className="absolute right-0 p-1 text-ink-gray/50 hover:text-ink-gray transition-colors"
                >
                  <X className="w-4 h-4" strokeWidth={1.5} />
                </button>
              )}
            </div>

            {/* 取消按钮 */}
            <button
              type="button"
              onClick={handleClose}
              className={cn(
                "font-serif text-base text-ink-gray",
                "hover:text-ink-black",
                "transition-colors duration-200",
                "shrink-0"
              )}
            >
              取消
            </button>
          </div>
        </header>

        {/* 核心内容区 - 标签流 */}
        <div className="flex-1 space-y-10 pb-12">
          
          {/* 历史印记 */}
          <section 
            className={cn(
              "transition-all duration-500 delay-100",
              isVisible && !isClosing 
                ? "opacity-100 translate-y-0" 
                : "opacity-0 translate-y-4"
            )}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-sm text-ink-gray tracking-wider">
                历史印记
              </h2>
              <button
                type="button"
                onClick={handleClearHistory}
                className="font-serif text-xs text-ink-gray/50 hover:text-ink-gray transition-colors"
              >
                清除
              </button>
            </div>
            
            {/* 标签流 */}
            <div className="flex flex-wrap gap-3">
              {historyTags.map((tag, index) => (
                <button
                  key={`history-${index}`}
                  type="button"
                  onClick={() => handleTagClick(tag)}
                  className={cn(
                    "px-4 py-2",
                    "bg-stone-100/60",
                    "rounded-full",
                    "font-serif text-sm text-ink-black/80",
                    "transition-all duration-200",
                    "hover:bg-stone-200/60 hover:text-ink-black",
                    "active:scale-95"
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          </section>

          {/* 热门修习 */}
          <section 
            className={cn(
              "transition-all duration-500 delay-200",
              isVisible && !isClosing 
                ? "opacity-100 translate-y-0" 
                : "opacity-0 translate-y-4"
            )}
          >
            <h2 className="font-serif text-sm text-ink-gray tracking-wider mb-4">
              热门修习
            </h2>
            
            {/* 标签流 - 带边框样式 */}
            <div className="flex flex-wrap gap-3">
              {trendingTags.map((tag, index) => (
                <button
                  key={`trending-${index}`}
                  type="button"
                  onClick={() => handleTagClick(tag)}
                  className={cn(
                    "px-4 py-2",
                    "rounded-full",
                    "border border-stone-300",
                    "font-serif text-sm text-ink-black/80",
                    "transition-all duration-200",
                    "hover:border-stone-400 hover:text-ink-black",
                    "active:scale-95",
                    // 偶数项带淡红色背景
                    index % 2 === 1 && "bg-red-50/50 border-red-200/60 hover:border-red-300/80"
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          </section>

          {/* 搜索建议区 - 当有输入时显示 */}
          {searchValue && (
            <section 
              className={cn(
                "transition-all duration-300",
                "opacity-100"
              )}
            >
              <h2 className="font-serif text-sm text-ink-gray tracking-wider mb-4">
                搜索建议
              </h2>
              
              <div className="space-y-1">
                {[`${searchValue}的含义`, `${searchValue}的用法`, `${searchValue}相关词汇`].map((suggestion, index) => (
                  <button
                    key={`suggestion-${index}`}
                    type="button"
                    className={cn(
                      "w-full py-3 px-2",
                      "flex items-center gap-3",
                      "text-left",
                      "rounded-lg",
                      "transition-colors duration-200",
                      "hover:bg-stone-100/50"
                    )}
                  >
                    <Search className="w-4 h-4 text-ink-gray/40" strokeWidth={1.5} />
                    <span className="font-serif text-base text-ink-black/80">
                      {suggestion}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* 底部留白 - 模拟键盘安全区 */}
        <div className="h-[env(safe-area-inset-bottom,20px)]" />
      </div>
    </main>
  )
}
