"use client"

import { cn } from "@/lib/utils"
import { useLanguage } from "@/lib/contexts/language-context"
import { TRANSLATIONS } from "@/lib/i18n"

export type CategoryType = "daily" | "finance" | "travel" | "business" | "technology" | "culture"

interface CategoryOption {
  id: CategoryType
  icon: string
}

const categoryOptions: CategoryOption[] = [
  { id: "daily", icon: "🏠" },
  { id: "finance", icon: "💰" },
  { id: "travel", icon: "✈️" },
  { id: "business", icon: "💼" },
  { id: "technology", icon: "💻" },
  { id: "culture", icon: "🎨" },
]

interface CategorySelectorProps {
  selectedCategory: CategoryType
  onCategoryChange: (category: CategoryType) => void
}

export function CategorySelector({ selectedCategory, onCategoryChange }: CategorySelectorProps) {
  const { learningMode } = useLanguage()
  const t = TRANSLATIONS[learningMode]
  
  return (
    <div className="w-full pb-2">
      <div className="flex flex-col gap-3 px-4">
        {categoryOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onCategoryChange(option.id)}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl",
              "font-serif text-base transition-all duration-200",
              "w-full",
              selectedCategory === option.id
                ? "bg-[#C23E32] text-white shadow-md"
                : "bg-white/80 border border-stone-200 text-ink-black/80 hover:border-stone-300 hover:bg-white/90"
            )}
          >
            <span className="text-xl">{option.icon}</span>
            <span className="font-medium">{t.practice.categories[option.id]}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
