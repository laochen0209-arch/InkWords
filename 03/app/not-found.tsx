"use client"

import Link from "next/link"
import { Home } from "lucide-react"
import { cn } from "@/lib/utils"

export default function NotFound() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* 水墨山水背景 */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/ink-landscape-bg.jpg')",
          opacity: 0.2,
          filter: "blur(2px)",
        }}
        aria-hidden="true"
      />
      
      {/* 宣纸底色 */}
      <div 
        className="fixed inset-0 -z-20 bg-[#FDFBF7]" 
        aria-hidden="true" 
      />

      {/* 巨大背景水印字 - 空 */}
      <div 
        className={cn(
          "absolute inset-0",
          "flex items-center justify-center",
          "pointer-events-none select-none"
        )}
        aria-hidden="true"
      >
        <span 
          className={cn(
            "font-serif",
            "text-[12rem] md:text-[18rem] lg:text-[24rem]",
            "text-stone-900/[0.03]",
            "blur-[1px]",
            "tracking-tighter"
          )}
        >
          空
        </span>
      </div>

      {/* 主内容区 */}
      <div className="relative z-10 flex flex-col items-center text-center px-6">
        {/* 错误代码标签 */}
        <div 
          className={cn(
            "mb-8",
            "px-4 py-1.5",
            "border border-stone-300",
            "rounded-full",
            "text-xs font-sans text-ink-gray tracking-wider"
          )}
        >
          Error 404
        </div>

        {/* 主标题 */}
        <h1 
          className={cn(
            "font-serif",
            "text-3xl md:text-4xl lg:text-5xl",
            "text-ink-black",
            "tracking-wider",
            "mb-4"
          )}
        >
          云深不知处
        </h1>

        {/* 副标题 */}
        <p 
          className={cn(
            "font-serif",
            "text-sm md:text-base",
            "text-ink-gray",
            "tracking-wide",
            "mb-12"
          )}
        >
          客官，您访问的页面似乎已隐入烟雨中。
        </p>

        {/* 返回按钮 */}
        <Link
          href="/"
          className={cn(
            "inline-flex items-center gap-2",
            "px-8 py-3",
            "bg-[#C23E32] text-white",
            "rounded-full",
            "font-serif text-sm tracking-wider",
            "shadow-lg shadow-red-900/20",
            "transition-all duration-300",
            "hover:bg-[#A33428] hover:shadow-xl hover:shadow-red-900/30",
            "active:scale-[0.98]",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C23E32] focus-visible:ring-offset-2"
          )}
        >
          <Home className="w-4 h-4" />
          返回墨语
        </Link>
      </div>

      {/* 底部装饰线 */}
      <div 
        className={cn(
          "absolute bottom-12",
          "w-16 h-px",
          "bg-gradient-to-r from-transparent via-stone-300 to-transparent"
        )}
        aria-hidden="true"
      />
    </main>
  )
}
