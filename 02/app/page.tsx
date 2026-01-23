"use client"

import { useState } from "react"
import { LibraryHeader } from "@/components/library/library-header"
import { LibraryList } from "@/components/library/library-list"
import { BottomNavBar } from "@/components/library/bottom-nav-bar"
import { FilterSheet } from "@/components/library/filter-sheet"

export default function LibraryPage() {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  
  return (
    <>
      {/* Layer 1: 固定背景层 - 水墨山水 */}
      <div 
        className="fixed inset-0 z-0 bg-ink-paper ink-landscape-bg"
        aria-hidden="true"
      />
      
      {/* Layer 2: 可滚动内容区 */}
      <main className="relative z-10 min-h-screen overflow-y-auto">
        {/* 顶部栏 */}
        <LibraryHeader onFilterClick={() => setIsFilterOpen(true)} />
        
        {/* 列表内容区 - 添加 pt-16 避开顶部栏，pb-24 避开底部导航 */}
        <div className="pt-16 pb-24">
          <LibraryList />
        </div>
      </main>
      
      {/* Layer 3: 固定底部导航栏 */}
      <BottomNavBar activeTab="library" />
      
      {/* 筛选面板 */}
      <FilterSheet 
        isOpen={isFilterOpen} 
        onClose={() => setIsFilterOpen(false)} 
      />
    </>
  )
}
