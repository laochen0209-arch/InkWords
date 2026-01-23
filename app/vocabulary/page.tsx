"use client"

import { useState } from "react"
import { ArrowLeft, Volume2, X, BookOpen } from "lucide-react"
import Link from "next/link"
import { motion, Variants } from "framer-motion"
import { VocabularyCard } from "@/components/vocabulary/vocabulary-card"
import { BottomNavBar } from "@/components/library/bottom-nav-bar"

interface WordItem {
  id: string
  word: string
  phonetic: string
  translation: string
  mastered: boolean
}

const mockWords: WordItem[] = [
  { id: "1", word: "Serendipity", phonetic: "/ˌserənˈdɪpɪti/", translation: "意外发现美好事物的运气", mastered: false },
  { id: "2", word: "Ephemeral", phonetic: "/ɪˈfemərəl/", translation: "短暂的，转瞬即逝的", mastered: true },
  { id: "3", word: "Mellifluous", phonetic: "/meˈlɪfluəs/", translation: "（声音）甜美流畅的", mastered: false },
  { id: "4", word: "Petrichor", phonetic: "/ˈpetrɪkɔːr/", translation: "雨后泥土的芬芳", mastered: true },
  { id: "5", word: "Ethereal", phonetic: "/ɪˈθɪəriəl/", translation: "缥缈的，超凡脱俗的", mastered: false },
  { id: "6", word: "Sonder", phonetic: "/ˈsɒndər/", translation: "意识到每个路人都有丰富人生", mastered: false },
  { id: "7", word: "Luminescence", phonetic: "/ˌluːmɪˈnesns/", translation: "冷光，发光现象", mastered: true },
  { id: "8", word: "Vellichor", phonetic: "/ˈvelɪkɔːr/", translation: "旧书店的奇妙氛围", mastered: false },
]

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0,
      ease: "easeOut" as const,
    },
  },
}

const itemVariants: Variants = {
  hidden: { y: 10, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut" as const,
    },
  },
}

export default function VocabularyPage() {
  const [words, setWords] = useState<WordItem[]>(mockWords)
  const totalCount = words.length
  const masteredCount = words.filter(w => w.mastered).length
  const [activeTab, setActiveTab] = useState<"home" | "practice" | "library" | "profile">("library")
  
  const handleRemove = (id: string) => {
    setWords(prev => prev.filter(w => w.id !== id))
  }
  
  const handlePlay = (word: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word)
      utterance.lang = 'en-US'
      speechSynthesis.speak(utterance)
    }
  }

  return (
    <>
      <div 
        className="fixed inset-0 z-0 bg-ink-paper ink-landscape-bg"
        aria-hidden="true"
      />
      
      <main className="relative z-10 min-h-screen overflow-y-auto scrollbar-hide">
        <header className="fixed top-0 left-0 right-0 z-40 w-full h-14 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-stone-200/50">
          <div className="h-full w-full max-w-2xl mx-auto px-4 flex items-center">
            <Link 
              href="/"
              className="w-10 h-10 flex items-center justify-center text-ink-black hover:text-ink-vermilion transition-colors"
              aria-label="返回"
            >
              <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
            </Link>
            
            <h1 className="flex-1 text-center font-serif text-lg text-ink-black pr-10">
              生词本
            </h1>
          </div>
        </header>
        
        <div className="w-full min-h-screen bg-[#FDFBF7]/70 pt-14 pb-8 md:bg-transparent md:min-h-0 md:max-w-2xl md:mx-auto md:my-8 md:rounded-xl md:shadow-[0_4px_20px_rgba(43,43,43,0.08)]">
          <div className="px-4 py-4">
            <div className="bg-[#FDFBF7]/80 backdrop-blur-sm px-4 py-3 border border-stone-200/30 md:bg-stone-100/50">
              <p className="text-center text-sm text-ink-gray font-serif">
                共收藏 <span className="text-ink-black font-medium">{totalCount}</span> 词
                <span className="mx-3 text-stone-300">·</span>
                已掌握 <span className="text-ink-bamboo font-medium">{masteredCount}</span> 词
              </p>
            </div>
          </div>
          
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="px-4 space-y-3"
          >
            {words.map((item) => (
              <motion.div
                key={item.id}
                variants={itemVariants}
                layout
                className="bg-[#FDFBF7] md:bg-[#FDFBF7]/90 backdrop-blur-sm border border-stone-200/30 shadow-[0_2px_8px_rgba(43,43,43,0.04)] p-4"
              >
                <VocabularyCard 
                  item={item}
                  onRemove={handleRemove}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </main>
      
      <BottomNavBar activeTab={activeTab} onTabChange={setActiveTab} />
    </>
  )
}
