"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, Volume2, Settings, Type } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/lib/contexts/language-context"
import { TRANSLATIONS } from "@/lib/i18n"
import { InteractiveParagraph } from "./interactive-paragraph"

type ViewMode = "cn" | "en" | "both"

interface Article {
  id: string
  title_en: string
  title_zh: string
  author?: string
  author_en?: string
  source?: string
  date?: string
  content_en: string
  content_zh: string
}

interface ArticleReaderProps {
  article: Article
  mode?: "LEARN_ENGLISH" | "LEARN_CHINESE"
}

export function ArticleReader({ article, mode = "LEARN_ENGLISH" }: ArticleReaderProps) {
  const router = useRouter()
  const { learningMode, targetLang } = useLanguage()
  const t = TRANSLATIONS[learningMode]
  
  const [viewMode, setViewMode] = useState<ViewMode>(
    mode === "LEARN_ENGLISH" ? "en" : "cn"
  )
  const [fontSize, setFontSize] = useState<"base" | "lg" | "xl">("base")
  const [isPlaying, setIsPlaying] = useState<number | null>(null)

  useEffect(() => {
    setViewMode(mode === "LEARN_ENGLISH" ? "en" : "cn")
  }, [mode])

  const handleBack = () => {
    router.back()
  }

  const handlePlay = (paragraphIndex: number) => {
    setIsPlaying(paragraphIndex)
    if ('speechSynthesis' in window) {
      const text = viewMode === "en" 
        ? getEnglishParagraphs()[paragraphIndex]
        : getChineseParagraphs()[paragraphIndex]
      
      if (text) {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = viewMode === "en" ? 'en-US' : 'zh-CN'
        utterance.onend = () => setIsPlaying(null)
        speechSynthesis.speak(utterance)
      }
    }
  }

  const getEnglishParagraphs = () => {
    return article.content_en.split('\n').filter(p => p.trim())
  }

  const getChineseParagraphs = () => {
    return article.content_zh.split('\n').filter(p => p.trim())
  }

  const getVocabularySection = () => {
    const vocabRegex = /【重点词汇解析】([\s\S]*?)(?=\n|$)/g
    const matches = article.content_zh.match(vocabRegex)
    
    if (matches && matches.length > 0) {
      return matches.map((match, index) => (
        <div key={index} className="mt-8 p-6 bg-stone-50 rounded-xl border border-stone-200">
          <h3 className="text-sm font-bold text-stone-400 mb-3">重点词汇解析</h3>
          <div className="text-base text-ink-black leading-relaxed whitespace-pre-wrap">
            {match.replace(/【重点词汇解析】/g, '')}
          </div>
        </div>
      ))
    }
    return null
  }

  const renderContent = () => {
    const englishParagraphs = getEnglishParagraphs()
    const chineseParagraphs = getChineseParagraphs()
    
    if (viewMode === "en") {
      return (
        <div className="space-y-6">
          {englishParagraphs.map((para, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <InteractiveParagraph 
                text={para}
                lang="en-US"
                fontSize={fontSize}
                fontFamily="serif"
              />
            </motion.div>
          ))}
        </div>
      )
    }

    if (viewMode === "cn") {
      return (
        <div className="space-y-6">
          {chineseParagraphs.map((para, index) => (
            <motion.p
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "text-lg md:text-xl text-ink-black leading-loose",
                isPlaying === index && "bg-stone-200/50 -mx-4 px-4 py-3 rounded-lg transition-colors duration-300"
              )}
            >
              {para}
              {isPlaying === index && (
                <Volume2 className="inline-block ml-2 w-4 h-4 text-ink-vermilion animate-pulse" aria-label="正在朗读" />
              )}
            </motion.p>
          ))}
        </div>
      )
    }

    if (viewMode === "both") {
      const maxParagraphs = Math.max(englishParagraphs.length, chineseParagraphs.length)
      
      return (
        <div className="space-y-8">
          {Array.from({ length: maxParagraphs }).map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {englishParagraphs[index] && (
                <div className="p-4 bg-white rounded-xl shadow-sm border border-stone-100">
                  <h3 className="text-xs font-bold text-stone-400 mb-2 uppercase tracking-wider">ORIGINAL</h3>
                  <InteractiveParagraph 
                    text={englishParagraphs[index]}
                    lang="en-US"
                    fontSize={fontSize}
                    fontFamily="serif"
                  />
                </div>
              )}
              
              {chineseParagraphs[index] && (
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-100">
                  <h3 className="text-xs font-bold text-stone-400 mb-2 uppercase tracking-wider">TRANSLATION</h3>
                  <p className="text-lg md:text-xl text-ink-black leading-loose">
                    {chineseParagraphs[index]}
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )
    }
  }

  const getFontSizeClass = () => {
    switch (fontSize) {
      case "base":
        return "text-lg md:text-xl"
      case "lg":
        return "text-xl md:text-2xl"
      case "xl":
        return "text-2xl md:text-3xl"
      default:
        return "text-lg md:text-xl"
    }
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#FDFBF7]/80 backdrop-blur-md border-b border-ink-gray/10">
        <div className="max-w-2xl mx-auto h-full px-4 flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            className="w-10 h-10 flex items-center justify-center rounded-full text-ink-gray hover:text-ink-black hover:bg-ink-gray/10 transition-all duration-200"
            aria-label="返回"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <div className="flex flex-col items-center">
            <h1 className={cn(
              "font-serif font-bold tracking-wide",
              mode === "LEARN_ENGLISH" ? "text-lg text-ink-black" : "text-base text-ink-gray"
            )}>
              {mode === "LEARN_ENGLISH" ? article.title_en : article.title_zh}
            </h1>
            <p className={cn(
              "text-sm",
              mode === "LEARN_ENGLISH" ? "text-ink-gray" : "text-ink-black"
            )}>
              {mode === "LEARN_ENGLISH" ? article.title_zh : article.title_en}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFontSize(prev => prev === "base" ? "lg" : prev === "lg" ? "xl" : "base")}
              className="w-10 h-10 flex items-center justify-center rounded-full text-ink-gray hover:text-ink-black hover:bg-ink-gray/10 transition-all duration-200"
              aria-label="字体大小"
            >
              <Type className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 min-h-screen overflow-y-auto pt-20 pb-32">
        <motion.div
          className="max-w-2xl mx-auto px-4 py-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <article className="bg-[#FDFBF7]/90 rounded-none shadow-none md:rounded-sm md:shadow-[0_4px_20px_rgba(43,43,43,0.08)] md:my-8 p-8 md:p-12">
            <header className="text-center mb-10">
              <h1 className="font-serif text-3xl md:text-4xl text-ink-black font-semibold tracking-wide mb-3">
                {article.title_en}
              </h1>
              <h2 className="font-serif text-xl md:text-2xl text-ink-gray/70 mb-4">
                {article.title_zh}
              </h2>
              
              {(article.author || article.source) && (
                <div className="flex items-center justify-center gap-4 text-sm text-ink-gray mb-6">
                  {article.author && <span>{article.author}</span>}
                  {article.author && article.source && <span>·</span>}
                  {article.source && <span>{article.source}</span>}
                  {article.date && <span>·</span>}
                  {article.date && <span>{article.date}</span>}
                </div>
              )}

              <div className="mt-6 mx-auto w-32 h-px bg-gradient-to-r from-transparent via-ink-gray/40 to-transparent" />
            </header>

            <div className="flex items-center justify-center gap-2 mb-8 overflow-x-auto pb-2">
              <button
                type="button"
                onClick={() => setViewMode("cn")}
                className={cn(
                  "px-6 py-2 rounded-full font-serif text-base transition-all duration-200 whitespace-nowrap",
                  viewMode === "cn" ? "bg-[#C23E32] text-white font-medium shadow-md" : "bg-white text-ink-gray/70 hover:bg-stone-50 border-2 border-stone-300"
                )}
              >
                🇨🇳 中文
              </button>
              <button
                type="button"
                onClick={() => setViewMode("en")}
                className={cn(
                  "px-6 py-2 rounded-full font-serif text-base transition-all duration-200 whitespace-nowrap",
                  viewMode === "en" ? "bg-[#C23E32] text-white font-medium shadow-md" : "bg-white text-ink-gray/70 hover:bg-stone-50 border-2 border-stone-300"
                )}
              >
                🇺🇸 英文
              </button>
              <button
                type="button"
                onClick={() => setViewMode("both")}
                className={cn(
                  "px-6 py-2 rounded-full font-serif text-base transition-all duration-200 whitespace-nowrap",
                  viewMode === "both" ? "bg-[#C23E32] text-white font-medium shadow-md" : "bg-white text-ink-gray/70 hover:bg-stone-50 border-2 border-stone-300"
                )}
              >
                🌗 双语
              </button>
            </div>

            <div className={cn("font-serif leading-loose", getFontSizeClass())}>
              {renderContent()}
            </div>

            {getVocabularySection()}
          </article>
        </motion.div>
      </main>
    </>
  )
}
