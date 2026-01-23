"use client"

import { cn } from "@/lib/utils"

interface LanguageOption {
  id: string
  label: string
  native?: string
}

interface LanguageSelectorProps {
  title: string
  options: LanguageOption[]
  selected: string | null
  onSelect: (id: string) => void
}

export function LanguageSelector({ 
  title, 
  options, 
  selected, 
  onSelect 
}: LanguageSelectorProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* 标题 */}
      <h3 className="font-serif text-base md:text-lg text-ink-black font-medium">
        {title}
      </h3>
      
      {/* 语言选项列表 */}
      <div className="flex flex-col gap-3">
        {options.map((option) => {
          const isSelected = selected === option.id
          
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(option.id)}
              className={cn(
                "relative px-5 py-3 text-left transition-all duration-300",
                "border rounded-sm",
                // 默认状态 - 素雅玉牌
                "border-ink-gray/30 bg-transparent",
                // 选中状态 - 朱砂红晕染
                isSelected && [
                  "border-ink-vermilion bg-red-50/50",
                  "animate-ink-spread"
                ],
                // 悬停效果
                !isSelected && "hover:border-ink-gray/50 hover:bg-ink-paper/50"
              )}
            >
              <span 
                className={cn(
                  "font-serif text-sm md:text-base transition-colors duration-300",
                  isSelected ? "text-ink-vermilion font-medium" : "text-ink-black"
                )}
              >
                {option.label}
              </span>
              {option.native && option.native !== option.label && (
                <span 
                  className={cn(
                    "ml-2 text-xs transition-colors duration-300",
                    isSelected ? "text-ink-vermilion/70" : "text-ink-gray"
                  )}
                >
                  ({option.native})
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
