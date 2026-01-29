"use client"

import { useState } from "react"
import { ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface ReaderHeaderProps {
  displayMode?: "cn" | "en" | "both"
  onDisplayModeChange?: (mode: "cn" | "en" | "both") => void
}

export function ReaderHeader({ 
  displayMode = "both", 
  onDisplayModeChange 
}: ReaderHeaderProps) {
  const router = useRouter()
  const [currentMode, setCurrentMode] = useState<"cn" | "en" | "both">(displayMode)

  const handleModeChange = (mode: "cn" | "en" | "both") => {
    setCurrentMode(mode)
    onDisplayModeChange?.(mode)
  }

  const handleBack = () => {
    router.back()
  }

  return (
    <header 
      className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#FDFBF7]/80 backdrop-blur-md border-b border-ink-gray/10"
    >
      <div className="max-w-2xl mx-auto h-full px-4 flex items-center justify-between">
        <button
          type="button"
          onClick={handleBack}
          className="w-10 h-10 flex items-center justify-center rounded-full text-ink-gray hover:text-ink-black hover:bg-ink-gray/10 transition-all duration-200"
          aria-label="返回"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        {/* 右侧中英切换开关 */}
        <div 
          className="flex items-center h-8 border border-ink-gray/30 rounded-full overflow-hidden"
          role="tablist"
          aria-label="语言切换"
        >
          <button
            type="button"
            role="tab"
            aria-selected={currentMode === "cn" || currentMode === "both"}
            onClick={() => handleModeChange("cn")}
            className={cn(
              "px-4 h-full text-sm font-medium transition-all duration-200",
              (currentMode === "cn" || currentMode === "both")
                ? "bg-[#C23E32] text-white" 
                : "text-ink-gray hover:text-ink-black"
            )}
          >
            中
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
            英
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
            双语
          </button>
        </div>
      </div>
    </header>
  )
}
