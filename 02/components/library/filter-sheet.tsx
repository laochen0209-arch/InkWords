"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface FilterSheetProps {
  isOpen: boolean
  onClose: () => void
}

const readStatusOptions = [
  { id: "all", label: "全部" },
  { id: "unread", label: "未读" },
  { id: "read", label: "已读" },
]

const categoryOptions = [
  { id: "all", label: "全部" },
  { id: "poetry", label: "诗词" },
  { id: "prose", label: "散文" },
  { id: "classic", label: "经典" },
]

export function FilterSheet({ isOpen, onClose }: FilterSheetProps) {
  const [readStatus, setReadStatus] = useState("all")
  const [category, setCategory] = useState("all")
  
  if (!isOpen) return null
  
  return (
    <>
      {/* 遮罩层 */}
      <div 
        className="fixed inset-0 z-[60] bg-ink-black/20 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* 筛选面板 */}
      <div 
        className={cn(
          "fixed bottom-0 left-0 right-0 z-[70]",
          "bg-ink-paper border-t border-ink-gray/20",
          "animate-in slide-in-from-bottom duration-300"
        )}
        role="dialog"
        aria-label="筛选选项"
      >
        {/* 头部 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-ink-gray/10">
          <h3 className="font-serif text-base text-ink-black font-medium">
            筛选
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-ink-gray hover:text-ink-black transition-colors"
            aria-label="关闭"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* 筛选内容 */}
        <div className="px-4 py-5 space-y-6">
          {/* 阅读状态 */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm text-ink-black">阅读状态</h4>
            <div className="flex gap-3">
              {readStatusOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setReadStatus(option.id)}
                  className={cn(
                    "px-4 py-2 text-sm border transition-all duration-200",
                    readStatus === option.id
                      ? "border-ink-vermilion bg-red-50/50 text-ink-vermilion font-medium"
                      : "border-ink-gray/30 text-ink-gray hover:border-ink-gray/50"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* 分类 */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm text-ink-black">分类</h4>
            <div className="flex flex-wrap gap-3">
              {categoryOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setCategory(option.id)}
                  className={cn(
                    "px-4 py-2 text-sm border transition-all duration-200",
                    category === option.id
                      ? "border-ink-vermilion bg-red-50/50 text-ink-vermilion font-medium"
                      : "border-ink-gray/30 text-ink-gray hover:border-ink-gray/50"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* 底部按钮 */}
        <div className="px-4 py-4 border-t border-ink-gray/10 flex gap-3">
          <button
            type="button"
            onClick={() => {
              setReadStatus("all")
              setCategory("all")
            }}
            className="flex-1 py-3 text-sm border border-ink-gray/30 text-ink-gray hover:border-ink-gray/50 transition-colors"
          >
            重置
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 text-sm bg-ink-vermilion text-ink-paper hover:bg-ink-vermilion/90 transition-colors"
          >
            确定
          </button>
        </div>
      </div>
    </>
  )
}
