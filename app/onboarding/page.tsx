"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

export default function OnboardingPage() {
  const router = useRouter()
  const [selectedOption, setSelectedOption] = useState<"chinese" | "english" | null>(null)
  
  const handleChineseSelect = () => {
    setSelectedOption("chinese")
    localStorage.setItem("inkwords_native_lang", "en")
    localStorage.setItem("inkwords_target_lang", "zh")
    localStorage.setItem("inkwords_learning_mode", "LEARN_CHINESE")
  }
  
  const handleEnglishSelect = () => {
    setSelectedOption("english")
    localStorage.setItem("inkwords_native_lang", "zh")
    localStorage.setItem("inkwords_target_lang", "en")
    localStorage.setItem("inkwords_learning_mode", "LEARN_ENGLISH")
  }
  
  const handleContinue = () => {
    if (selectedOption) {
      router.push("/")
    }
  }
  
  return (
    <main className="min-h-screen bg-ink-paper ink-landscape-bg">
      <div 
        className="fixed inset-0 z-0 pointer-events-none"
        aria-hidden="true"
      />
      
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-8">
        <div 
          className="w-full max-w-2xl bg-ink-paper border border-border/50"
          style={{ 
            aspectRatio: "4/3",
            boxShadow: "var(--shadow-ink)"
          }}
        >
          <div className="h-full flex flex-col p-6 md:p-10">
            <header className="text-center mb-8 md:mb-10">
              <h1 className="font-serif text-2xl md:text-3xl lg:text-4xl text-ink-black font-semibold tracking-wide">
                Start Learning
                <span className="text-lg md:text-xl lg:text-2xl text-ink-gray/70 block mt-2">
                  开启学习之旅
                  <span className="block text-ink-gray/50 mt-1">
                    Start Learning
                  </span>
                </span>
              </h1>
              <p className="mt-2 text-sm text-ink-gray">
                Choose the language you want to learn.
                <span className="text-ink-gray/70 block mt-1">
                  选择您想要学习的语言
                </span>
              </p>
            </header>
            
            <div className="flex-1 flex flex-col md:flex-row gap-6 md:gap-0">
              <button
                type="button"
                onClick={handleChineseSelect}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center p-6 md:p-8 rounded-2xl transition-all duration-300",
                  "border-2",
                  selectedOption === "chinese" ? [
                    "border-[#C23E32] bg-red-50/50 shadow-xl",
                    "hover:scale-105 active:scale-95"
                  ] : [
                    "border-ink-gray/30 bg-transparent hover:border-[#C23E32]/50 hover:bg-[#C23E32]/5",
                    "hover:shadow-lg"
                  ]
                )}
              >
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-[#C23E32] to-[#A8352B] flex items-center justify-center shadow-lg">
                    <span className="text-3xl md:text-4xl font-serif text-white font-bold">
                      中
                    </span>
                  </div>
                  <div className="space-y-2">
                    <h2 className="font-serif text-xl md:text-2xl text-ink-black font-semibold">
                      中文&Chinese
                    </h2>
                    <p className="text-sm text-ink-gray">
                      Chinese & Chinese
                    </p>
                    <p className="text-xs text-ink-gray/60 mt-2">
                      网站以英文为主，中文为辅助
                      <span className="block text-ink-gray/50 mt-1">
                        Website in English, Chinese as auxiliary
                      </span>
                      <span className="block text-ink-gray/50 mt-1">
                        网站英文为主，中文为辅
                      </span>
                    </p>
                  </div>
                </div>
              </button>
              
              <button
                type="button"
                onClick={handleEnglishSelect}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center p-6 md:p-8 rounded-2xl transition-all duration-300",
                  "border-2",
                  selectedOption === "english" ? [
                    "border-[#2B5B9F] bg-blue-50/50 shadow-xl",
                    "hover:scale-105 active:scale-95"
                  ] : [
                    "border-ink-gray/30 bg-transparent hover:border-[#2B5B9F]/50 hover:bg-[#2B5B9F]/5",
                    "hover:shadow-lg"
                  ]
                )}
              >
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-[#2B5B9F] to-[#1E40AF] flex items-center justify-center shadow-lg">
                    <span className="text-3xl md:text-4xl font-serif text-white font-bold">
                      英
                    </span>
                  </div>
                  <div className="space-y-2">
                    <h2 className="font-serif text-xl md:text-2xl text-ink-black font-semibold">
                      英语&English
                    </h2>
                    <p className="text-sm text-ink-gray">
                      English & English
                    </p>
                    <p className="text-xs text-ink-gray/60 mt-2">
                      网站以中文为主，英文为辅助
                      <span className="block text-ink-gray/50 mt-1">
                        Website in Chinese, English as auxiliary
                      </span>
                    </p>
                  </div>
                </div>
              </button>
            </div>
            
            <footer className="mt-6 md:mt-8 flex justify-center">
              <button
                type="button"
                onClick={handleContinue}
                disabled={!selectedOption}
                className={cn(
                  "w-14 h-14 md:w-16 md:h-16 rounded-full",
                  "flex items-center justify-center",
                  "transition-all duration-300",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-vermilion focus-visible:ring-offset-2",
                  selectedOption ? [
                    "bg-ink-vermilion text-ink-paper",
                    "shadow-lg hover:shadow-xl",
                    "hover:scale-105 active:scale-95"
                  ] : [
                    "bg-ink-gray/20 text-ink-gray/50",
                    "cursor-not-allowed"
                  ]
                )}
                aria-label="继续"
              >
                <ArrowRight 
                  className={cn(
                    "w-6 h-6 md:w-7 md:h-7",
                    "transition-transform duration-300",
                    selectedOption && "group-hover:translate-x-0.5"
                  )} 
                />
              </button>
            </footer>
          </div>
        </div>
        
        <p className="mt-6 text-xs text-ink-gray/60 text-center">
          Language preferences can be changed in settings
          <span className="text-ink-gray/50 block mt-1">
            语言偏好可在设置中更改
          </span>
        </p>
      </div>
    </main>
  )
}
