"use client"

import { ReaderHeader } from "@/components/reader/reader-header"
import { ReaderContent } from "@/components/reader/reader-content"
import { ReaderToolbar } from "@/components/reader/reader-toolbar"

export default function ReaderPage() {
  return (
    <>
      {/* Layer 1: 固定背景层 - 水墨山水 */}
      <div 
        className="fixed inset-0 z-0 bg-ink-paper ink-landscape-bg"
        aria-hidden="true"
      />
      
      {/* Layer 2: 可滚动内容区 */}
      <main className="relative z-10 min-h-screen overflow-y-auto">
        {/* 顶部导航栏 */}
        <ReaderHeader />
        
        {/* 阅读内容区 - pt-20 避开顶部栏，pb-32 避开底部工具栏 */}
        <div className="pt-20 pb-32">
          <ReaderContent />
        </div>
      </main>
      
      {/* Layer 3: 固定底部工具栏 */}
      <ReaderToolbar />
    </>
  )
}
