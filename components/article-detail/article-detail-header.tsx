"use client"

import { useState } from "react"
import { ChevronLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/lib/contexts/language-context"
import { TRANSLATIONS } from "@/lib/i18n"

interface ArticleDetailHeaderProps {
  displayMode?: "cn" | "en" | "both"
  onDisplayModeChange?: (mode: "cn" | "en" | "both") => void
  nativeLang?: "zh" | "en"
}

export function ArticleDetailHeader({ 
  displayMode = "both", 
  onDisplayModeChange,
  nativeLang = "zh"
}: ArticleDetailHeaderProps) {
  const router = useRouter()
  const { learningMode } = useLanguage()
  const t = TRANSLATIONS[learningMode]
  const [currentMode, setCurrentMode] = useState<"cn" | "en" | "both">(displayMode)
  
  const handleBack = () => {
    router.back()
  }

  const handleModeChange = (mode: "cn" | "en" | "both") => {
    setCurrentMode(mode)
    onDisplayModeChange?.(mode)
  }

  const shouldDisplayChinese = () => {
    return learningMode === "LEARN_ENGLISH"
  }

  return (
    <header 
      className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#FDFBF7]/80 backdrop-blur-md border-b border-ink-gray/10"
    >
      <div className="max-w-2xl mx-auto h-full px-4 flex items-center justify-between">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full text-ink-gray hover:text-ink-black hover:bg-ink-gray/5 transition-all duration-200"
          aria-label={shouldDisplayChinese() ? "返回" : "Back"}
        >
          <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
          <span className="text-sm font-medium">
            {shouldDisplayChinese() ? "返回" : "Back"}
          </span>
        </button>
        
        <div 
          className="flex items-center h-8 border border-ink-gray/30 rounded-full overflow-hidden"
          role="tablist"
          aria-label={shouldDisplayChinese() ? "语言切换" : "Language Toggle"}
        >
          <button
            type="button"
            role="tab"
            aria-selected={currentMode === "cn"}
            onClick={() => handleModeChange("cn")}
            className={cn(
              "px-4 h-full text-sm font-medium transition-all duration-200",
              currentMode === "cn"
                ? "bg-[#C23E32] text-white" 
                : "text-ink-gray hover:text-ink-black"
            )}
          >
            {shouldDisplayChinese() ? "中" : "CN"}
          </button>
          <div className="w-px h-4 bg-ink-gray/30" />
          <button
            type="button"
            role="tab"
            aria-selected={currentMode === "en"}
            onClick={() => handleModeChange("en")}
            className={cn(
              "px-4 h-full text-sm font-medium transition-all duration-200",
              currentMode === "en"
                ? "bg-[#C23E32] text-white" 
                : "text-ink-gray hover:text-ink-black"
            )}
          >
            {shouldDisplayChinese() ? "英" : "EN"}
          </button>
          <div className="w-px h-4 bg-ink-gray/30" />
          <button
            type="button"
            role="tab"
            aria-selected={currentMode === "both"}
            onClick={() => handleModeChange("both")}
            className={cn(
              "px-4 h-full text-sm font-medium transition-all duration-200",
              currentMode === "both"
                ? "bg-[#C23E32] text-white" 
                : "text-ink-gray hover:text-ink-black"
            )}
          >
            {shouldDisplayChinese() ? "双语" : "Both"}
          </button>
        </div>
      </div>
    </header>
  )
}
