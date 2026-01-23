"use client"

import { SlidersHorizontal } from "lucide-react"

interface LibraryHeaderProps {
  onFilterClick: () => void
}

export function LibraryHeader({ onFilterClick }: LibraryHeaderProps) {
  return (
    <header 
      className="fixed top-0 left-0 right-0 z-50 h-16 px-4 flex items-center justify-between bg-ink-paper/80 backdrop-blur-md border-b border-ink-gray/10"
    >
      {/* 左侧标题 */}
      <h1 className="font-serif text-xl text-ink-black font-semibold tracking-wider">
        文库
      </h1>
      
      {/* 右侧筛选按钮 */}
      <button
        type="button"
        onClick={onFilterClick}
        className="w-10 h-10 flex items-center justify-center text-ink-gray hover:text-ink-black transition-colors duration-200"
        aria-label="筛选"
      >
        <SlidersHorizontal className="w-5 h-5" />
      </button>
    </header>
  )
}
