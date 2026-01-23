"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { ArrowRight, BookOpen, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/lib/contexts/language-context"
import { TRANSLATIONS } from "@/lib/i18n"

export default function OnboardingPage() {
  const router = useRouter()
  const { learningMode, switchMode } = useLanguage()
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  const t = TRANSLATIONS[learningMode]

  const features = [
    {
      icon: BookOpen,
      title: learningMode === "LEARN_CHINESE" ? "海量词库" : "Extensive Vocabulary",
      description: learningMode === "LEARN_CHINESE" 
        ? "收录数万精选词汇，涵盖四六级、雅思、托福等"
        : "Tens of thousands of carefully selected words, covering CET-4/6, IELTS, TOEFL, etc.",
    },
    {
      icon: Sparkles,
      title: learningMode === "LEARN_CHINESE" ? "智能修习" : "Smart Learning",
      description: learningMode === "LEARN_CHINESE"
        ? "AI 辅助记忆，科学复习计划"
        : "AI-assisted memory, scientific review schedule",
    },
    {
      icon: BookOpen,
      title: learningMode === "LEARN_CHINESE" ? "水墨美学" : "Ink Aesthetics",
      description: learningMode === "LEARN_CHINESE"
        ? "新中式极简设计，沉浸式学习体验"
        : "Neo-Chinese minimalist design, immersive learning experience",
    },
  ]

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const handleNext = () => {
    if (currentStep < features.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      router.push("/library")
    }
  }

  const handleSkip = () => {
    router.push("/library")
  }

  return (
    <main className="min-h-screen bg-ink-paper ink-landscape-bg">
      <div 
        className="fixed inset-0 z-0 pointer-events-none"
        aria-hidden="true"
      />
      
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl mx-auto w-full"
        >
          <div className="text-center space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            >
              <h1 className="font-serif text-5xl md:text-6xl text-ink-black font-bold tracking-widest mb-4">
                {learningMode === "LEARN_CHINESE" ? "墨语" : "InkWords"}
              </h1>
              <p className="text-lg md:text-xl text-ink-gray/80 font-serif tracking-wide mb-8">
                {t.welcome.slogan}
              </p>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-3">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.1, ease: "easeOut" }}
                  className="bg-[#FDFBF7]/90 backdrop-blur-sm border border-stone-200/30 rounded-2xl p-8 shadow-[0_4px_20px_rgba(43,43,43,0.08)]"
                >
                  <div className="flex flex-col items-center gap-6">
                    <div className={cn(
                      "w-16 h-16 md:w-20 md:h-20",
                      "rounded-full",
                      "bg-gradient-to-br from-[#C23E32]/20 to-[#A33428]",
                      "flex items-center justify-center",
                      "shadow-lg shadow-red-900/20"
                    )}>
                      <feature.icon className="w-8 h-8 md:w-10 md:h-10 text-white" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-serif text-xl md:text-2xl text-ink-black font-semibold mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-sm md:text-base text-ink-gray/70 font-serif leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
              className="flex flex-col items-center gap-4"
            >
              <button
                type="button"
                onClick={handleSkip}
                className={cn(
                  "px-8 py-3",
                  "border-2 border-stone-300",
                  "text-stone-600 font-serif text-sm tracking-wider",
                  "rounded-full",
                  "hover:bg-stone-100 hover:border-stone-400",
                  "transition-all duration-300"
                )}
              >
                {t.common.cancel}
              </button>
              
              <button
                type="button"
                onClick={handleNext}
                className={cn(
                  "px-8 py-3",
                  "bg-[#C23E32] text-white",
                  "font-serif text-base tracking-wider",
                  "rounded-full",
                  "shadow-lg shadow-red-900/20",
                  "hover:bg-[#A33428] hover:shadow-xl hover:shadow-red-900/30",
                  "transition-all duration-300",
                  "active:scale-[0.98]",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C23E32] focus-visible:ring-offset-2"
                )}
              >
                {t.welcome.start}
                <ArrowRight className="w-5 h-5 ml-2" strokeWidth={1.5} />
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </main>
  )
}
