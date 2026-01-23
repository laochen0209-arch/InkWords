"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { submitPracticeResult, getPracticeStats } from "@/lib/practice-data"
import { useToast } from "@/components/ink-toast/toast-context"

const sessionStats = {
  newWords: 20,
  focusMinutes: 15,
  accuracy: 98,
}

const dailyQuotes = [
  { text: "锲而不舍，金石可镂", source: "《荀子·劝学》" },
  { text: "千里之行，始于足下", source: "《道德经》" },
  { text: "学而不厌，诲人不倦", source: "《论语》" },
  { text: "不积跬步，无以至千里", source: "《荀子·劝学》" },
  { text: "温故而知新，可以为师矣", source: "《论语》" },
]

export default function SessionCompletePage() {
  const router = useRouter()
  const { success, error } = useToast()
  const [showStamp, setShowStamp] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [showQuote, setShowQuote] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dailyQuote] = useState(() => 
    dailyQuotes[Math.floor(Math.random() * dailyQuotes.length)]
  )

  useEffect(() => {
    const stampTimer = setTimeout(() => setShowStamp(true), 200)
    const statsTimer = setTimeout(() => setShowStats(true), 800)
    const quoteTimer = setTimeout(() => setShowQuote(true), 1200)
    
    return () => {
      clearTimeout(stampTimer)
      clearTimeout(statsTimer)
      clearTimeout(quoteTimer)
    }
  }, [])

  useEffect(() => {
    if (showQuote && !isSubmitting) {
      handleSubmitPracticeResult()
    }
  }, [showQuote, isSubmitting])

  const handleSubmitPracticeResult = async () => {
    if (isSubmitting) return
    
    setIsSubmitting(true)
    
    try {
      const userId = "INK20240001"
      const result = {
        userId,
        score: sessionStats.accuracy,
        wordsCount: sessionStats.newWords,
        date: new Date()
      }
      
      const updatedStats = submitPracticeResult(result)
      
      console.log('Practice result submitted:', updatedStats)
      success("练习数据已保存！")
      
      setTimeout(() => {
        setIsSubmitting(false)
      }, 500)
    } catch (err) {
      console.error('Failed to submit practice result:', err)
      error("保存练习数据失败，请重试")
      setIsSubmitting(false)
    }
  }

  const handleBackHome = () => {
    if (isSubmitting) return
    router.push("/")
  }

  return (
    <main className="min-h-screen bg-ink-paper ink-landscape-bg">
      <div 
        className="fixed inset-0 z-0 pointer-events-none"
        aria-hidden="true"
      />
      
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-12 space-y-12">
        
        <div 
          className={cn(
            "transition-all duration-700 ease-out",
            showStamp 
              ? "opacity-100 scale-100" 
              : "opacity-0 scale-75"
          )}
        >
          <div 
            className={cn(
              "relative",
              "w-36 h-36 md:w-44 md:h-44",
              "border-4 border-[#C23E32]",
              "rounded-lg",
              "rotate-[-8deg]",
              "flex items-center justify-center",
              "bg-[#FDFBF7]/30",
              "shadow-lg shadow-red-900/10"
            )}
            style={{
              borderStyle: "solid",
            }}
          >
            <span 
              className={cn(
                "font-serif text-5xl md:text-6xl font-bold",
                  "text-[#C23E32]",
                  "tracking-wider",
                  "opacity-90",
                  "drop-shadow-[0_1px_1px_rgba(194,62,50,0.3)]"
              )}
            >
              大吉
            </span>
            
            <div className="absolute top-2 left-2 w-1.5 h-1.5 bg-[#C23E32] opacity-60 rounded-full" />
            <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#C23E32] opacity-60 rounded-full" />
            <div className="absolute bottom-2 left-2 w-1.5 h-1.5 bg-[#C23E32] opacity-60 rounded-full" />
            <div className="absolute bottom-2 right-2 w-1.5 h-1.5 bg-[#C23E32] opacity-60 rounded-full" />
          </div>
        </div>

        <div 
          className={cn(
            "flex justify-center gap-10 md:gap-16",
            "transition-all duration-700 ease-out delay-100",
            showStats 
              ? "opacity-100 translate-y-0" 
              : "opacity-0 translate-y-4"
          )}
        >
          <StatItem value={sessionStats.newWords} label="新词" />
          <StatItem value={`${sessionStats.focusMinutes}分`} label="专注" />
          <StatItem value={`${sessionStats.accuracy}%`} label="正确率" />
        </div>

        <div 
          className={cn(
            "text-center max-w-md px-4",
            "transition-all duration-700 ease-out delay-200",
            showQuote 
              ? "opacity-100 translate-y-0" 
              : "opacity-0 translate-y-4"
          )}
        >
          <p className="font-serif text-lg md:text-xl text-ink-black/80 tracking-wider leading-relaxed">
            「{dailyQuote.text}」
          </p>
          <p className="mt-2 text-sm text-ink-gray font-serif">
            —— {dailyQuote.source}
          </p>
        </div>

        <div 
          className={cn(
            "transition-all duration-700 ease-out delay-300",
            showQuote 
              ? "opacity-100 translate-y-0" 
              : "opacity-0 translate-y-4"
          )}
        >
          <button
            type="button"
            onClick={handleBackHome}
            disabled={isSubmitting}
            className={cn(
              "px-10 py-2.5",
              "border border-stone-400",
              "text-stone-600 font-serif text-sm tracking-wider",
              "rounded-full",
              "bg-transparent",
              "transition-all duration-300",
              "hover:bg-stone-100 hover:border-stone-500",
              "active:scale-[0.98]",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2",
              isSubmitting && "opacity-50 cursor-not-allowed"
            )}
          >
            {isSubmitting ? "保存中..." : "返回主页"}
          </button>
        </div>
      </div>
    </main>
  )
}

function StatItem({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="text-center">
      <p className="font-serif text-4xl md:text-5xl text-ink-black font-semibold tracking-wide">
        {value}
      </p>
      <p className="mt-1 text-sm text-ink-gray font-sans">
        {label}
      </p>
    </div>
  )
}
