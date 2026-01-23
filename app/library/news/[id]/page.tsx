"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ReaderHeader } from "@/components/reader/reader-header"
import { ReaderContent } from "@/components/reader/reader-content"
import { BookmarkPlus, Play, Type } from "lucide-react"
import { useToast } from "@/components/ink-toast/toast-context"
import { getLanguageSettings, NativeLang, TargetLang } from "@/lib/language-utils"

const newsContent = [
  {
    id: "1",
    titleZh: "AI革命：机器学习如何改变语言学习",
    titleEn: "AI Revolution: How Machine Learning is Transforming Language Learning",
    categoryZh: "科技",
    categoryEn: "Technology",
    source: "Tech Daily",
    time: "2小时前",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=80",
    content: [
      {
        id: 1,
        zh: "人工智能正在重塑我们进行语言教育的方式，提供个性化学习路径和实时反馈。",
        en: "Artificial intelligence is reshaping how we approach language education, offering personalized learning paths and real-time feedback.",
      },
      {
        id: 2,
        zh: "将机器学习算法集成到语言学习应用中，为全球学习者创造了前所未有的机会。",
        en: "The integration of machine learning algorithms into language learning applications has created unprecedented opportunities for learners worldwide.",
      },
      {
        id: 3,
        zh: "AI驱动的语言学习最显著的优势之一是它能够适应个人的学习风格和节奏。",
        en: "One of the most significant advantages of AI-powered language learning is its ability to adapt to individual learning styles and paces.",
      },
      {
        id: 4,
        zh: "传统的课堂环境往往难以满足多样化的学习需求，但AI系统可以分析表现数据并相应调整难度级别。",
        en: "Traditional classroom settings often struggle to accommodate diverse learning needs, but AI systems can analyze performance data and adjust difficulty levels accordingly.",
      },
      {
        id: 5,
        zh: "机器学习算法可以识别学生错误中的模式，并提供有针对性的练习来解决特定的弱点。",
        en: "Machine learning algorithms can identify patterns in student errors and provide targeted exercises to address specific weaknesses.",
      },
      {
        id: 6,
        zh: "这种个性化方法确保学习者专注于他们最需要改进的领域，使学习时间更加高效和有效。",
        en: "This personalized approach ensures that learners focus on areas where they need to most improvement, making study time more efficient and effective.",
      },
      {
        id: 7,
        zh: "此外，AI驱动的平台提供24/7全天候访问，允许学习者根据自己的方便进行练习。",
        en: "Furthermore, AI-powered platforms offer 24/7 accessibility, allowing learners to practice at their convenience.",
      },
      {
        id: 8,
        zh: "这种灵活性对于日程不规律的忙碌专业人士或学生特别有价值，他们无法承诺固定的上课时间。",
        en: "This flexibility is particularly valuable for busy professionals or students with irregular schedules who cannot commit to fixed class times.",
      },
      {
        id: 9,
        zh: "随着技术的不断发展，我们可以期待出现更加复杂的语言学习工具。",
        en: "As technology continues to evolve, we can expect even more sophisticated language learning tools to emerge.",
      },
      {
        id: 10,
        zh: "从先进的语音识别到虚拟现实沉浸，语言教育的未来看起来越来越有希望，并且对所有背景的学习者都更加可及。",
        en: "From advanced speech recognition to virtual reality immersion, the future of language education looks increasingly promising and accessible to learners of all backgrounds.",
      },
    ],
  },
]

const UI_TEXT = {
  zh: {
    addToVocabulary: "已加入生词本",
    fontSettings: "字体设置",
    play: "播放",
    fontSize: {
      base: "标准",
      lg: "大",
      xl: "超大"
    },
    fontFamily: {
      serif: "宋体",
      kaiti: "楷体"
    },
    close: "关闭"
  },
  en: {
    addToVocabulary: "Added to Vocabulary",
    fontSettings: "Font Settings",
    play: "Play",
    fontSize: {
      base: "Standard",
      lg: "Large",
      xl: "Extra Large"
    },
    fontFamily: {
      serif: "Serif",
      kaiti: "Kaiti"
    },
    close: "Close"
  }
}

export default function NewsReaderPage({ params }: { params: { id: string } }) {
  const toast = useToast()
  const [fontSize, setFontSize] = useState<"base" | "lg" | "xl">("base")
  const [fontFamily, setFontFamily] = useState<"serif" | "kaiti">("serif")
  const [displayMode, setDisplayMode] = useState<"cn" | "en" | "both">("both")
  const [isPlaying, setIsPlaying] = useState(false)
  const [showFontSettings, setShowFontSettings] = useState(false)
  const [nativeLang, setNativeLang] = useState<NativeLang>("zh")
  const [targetLang, setTargetLang] = useState<TargetLang>("en")

  const t = UI_TEXT[nativeLang]

  useEffect(() => {
    const settings = getLanguageSettings()
    setNativeLang(settings.nativeLang)
    setTargetLang(settings.targetLang)
  }, [])

  useEffect(() => {
    const handleStorageChange = () => {
      const settings = getLanguageSettings()
      setNativeLang(settings.nativeLang)
      setTargetLang(settings.targetLang)
    }

    window.addEventListener("storage", handleStorageChange)
    
    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  const article = newsContent[0]

  const handleAddToVocabulary = () => {
    toast.success(t.addToVocabulary)
  }

  const handleFontSettings = () => {
    setShowFontSettings(!showFontSettings)
  }

  const handlePlay = () => {
    setIsPlaying(!isPlaying)
    if (!isPlaying) {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(targetLang === "zh" ? article.content[0].zh : article.content[0].en)
        utterance.lang = targetLang === "zh" ? 'zh-CN' : 'en-US'
        speechSynthesis.speak(utterance)
      }
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

  const getFontFamilyClass = () => {
    switch (fontFamily) {
      case "serif":
        return "font-serif"
      case "kaiti":
        return "font-kaiti"
      default:
        return "font-serif"
    }
  }

  return (
    <>
      <div 
        className="fixed inset-0 z-0 bg-ink-paper ink-landscape-bg"
        aria-hidden="true"
      />
      
      <motion.main 
        className="relative z-10 min-h-screen overflow-y-auto"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.4, 
          ease: [0.4, 0, 0.2, 1] 
        }}
      >
        <ReaderHeader 
          displayMode={displayMode}
          onDisplayModeChange={setDisplayMode}
        />
        
        <motion.div 
          className="pt-20 pb-32"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.5, 
            delay: 0.1,
            ease: [0.4, 0, 0.2, 1] 
          }}
        >
          <article className="w-full md:max-w-2xl md:mx-auto md:px-4">
            <div className="w-full min-h-screen bg-[#FDFBF7]/90 rounded-none shadow-none md:min-h-0 md:rounded-sm md:shadow-[0_4px_20px_rgba(43,43,43,0.08)] md:my-8">
              <div className="p-8 md:p-12">
                {/* 标题区 */}
                <header className="text-center mb-10">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <span className="px-3 py-1 text-xs rounded-full font-medium bg-ink-vermilion/10 text-ink-vermilion">
                      {targetLang === "zh" ? article.categoryZh : article.categoryEn}
                    </span>
                    <span className="text-sm text-ink-gray">
                      {article.source}
                    </span>
                    <span className="text-sm text-ink-gray/60">
                      {article.time}
                    </span>
                  </div>

                  {/* 主标题 - 根据学习模式显示目标语言 */}
                  <h1 className={`${getFontSizeClass()} ${getFontFamilyClass()} text-ink-black font-semibold tracking-wide mb-2`}>
                    {targetLang === "zh" ? article.titleZh : article.titleEn}
                  </h1>

                  {/* 副标题 - 显示母语作为辅助 */}
                  <h2 className="text-sm text-gray-500 font-sans mt-2 mb-6">
                    {targetLang === "zh" ? article.titleEn : article.titleZh}
                  </h2>

                  <div className="mx-auto w-32 h-px bg-gradient-to-r from-transparent via-ink-gray/40 to-transparent" />
                </header>

                {/* 图片区 */}
                {article.image && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="mb-8"
                  >
                    <img
                      src={article.image}
                      alt={targetLang === "zh" ? article.titleZh : article.titleEn}
                      className="w-full h-auto rounded-xl shadow-lg object-cover"
                    />
                  </motion.div>
                )}

                {/* 正文区 */}
                <div className="space-y-6">
                  {article.content.map((paragraph) => (
                    <div key={paragraph.id} className="mb-6 last:mb-0">
                      {/* 目标语言段落 - 主要阅读内容，大字 */}
                      {(displayMode === "cn" || displayMode === "both") && (
                        <p className={`${getFontSizeClass()} ${getFontFamilyClass()} text-ink-black leading-relaxed tracking-wide`}>
                          {targetLang === "zh" ? paragraph.zh : paragraph.en}
                        </p>
                      )}

                      {/* 母语言段落 - 辅助参考内容，小字灰阶 */}
                      {(displayMode === "en" || displayMode === "both") && (
                        <p className="text-sm text-gray-500 mt-2 leading-normal font-sans">
                          {targetLang === "zh" ? paragraph.en : paragraph.zh}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </article>
        </motion.div>

        {/* 底部工具栏 */}
        <div className="fixed bottom-0 left-0 right-0 w-full h-16 bg-[#FDFBF7]/90 backdrop-blur-md border-t border-stone-100 rounded-none z-50">
          <div className="max-w-2xl mx-auto h-full px-4 flex items-center justify-between">
            <button
              type="button"
              onClick={handleAddToVocabulary}
              className="flex flex-col items-center justify-center gap-1 w-20 h-full text-ink-gray hover:text-ink-black transition-all duration-200 active:scale-95"
              aria-label={nativeLang === "zh" ? "加入生词本" : "Add to Vocabulary"}
            >
              <BookmarkPlus className="w-5 h-5" strokeWidth={1.5} />
              <span className="text-xs">{nativeLang === "zh" ? "生词本" : "Vocabulary"}</span>
            </button>
            
            <button
              type="button"
              onClick={handlePlay}
              className="flex items-center justify-center w-14 h-14 rounded-full bg-[#C23E32] hover:bg-[#A33428] active:scale-95 transition-all duration-200 shadow-md"
              aria-label={nativeLang === "zh" ? "播放全文" : "Play Full Text"}
            >
              <Play className="w-6 h-6 text-white ml-1" fill="white" strokeWidth={0} />
            </button>
            
            <button
              type="button"
              onClick={handleFontSettings}
              className="flex flex-col items-center justify-center gap-1 w-20 h-full text-ink-gray hover:text-ink-black transition-all duration-200 active:scale-95"
              aria-label={t.fontSettings}
            >
              <Type className="w-5 h-5" strokeWidth={1.5} />
              <span className="text-xs">{nativeLang === "zh" ? "字体" : "Font"}</span>
            </button>
          </div>
        </div>

        {/* 字体设置面板 */}
        {showFontSettings && (
          <div 
            className="fixed bottom-20 left-0 right-0 z-40 px-4"
            role="dialog"
            aria-label={t.fontSettings}
          >
            <div className="max-w-2xl mx-auto bg-[#FDFBF7]/95 backdrop-blur-md border border-stone-200/30 rounded-lg shadow-lg p-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-serif text-ink-black mb-2">{nativeLang === "zh" ? "字体大小" : "Font Size"}</h3>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFontSize("base")}
                      className={`flex-1 py-2 px-4 rounded-lg font-serif text-sm transition-all ${
                        fontSize === "base"
                          ? "bg-[#C23E32] text-white"
                          : "bg-stone-100 text-ink-gray hover:bg-stone-200"
                      }`}
                    >
                      {t.fontSize.base}
                    </button>
                    <button
                      type="button"
                      onClick={() => setFontSize("lg")}
                      className={`flex-1 py-2 px-4 rounded-lg font-serif text-sm transition-all ${
                        fontSize === "lg"
                          ? "bg-[#C23E32] text-white"
                          : "bg-stone-100 text-ink-gray hover:bg-stone-200"
                      }`}
                    >
                      {t.fontSize.lg}
                    </button>
                    <button
                      type="button"
                      onClick={() => setFontSize("xl")}
                      className={`flex-1 py-2 px-4 rounded-lg font-serif text-sm transition-all ${
                        fontSize === "xl"
                          ? "bg-[#C23E32] text-white"
                          : "bg-stone-100 text-ink-gray hover:bg-stone-200"
                      }`}
                    >
                      {t.fontSize.xl}
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-serif text-ink-black mb-2">{nativeLang === "zh" ? "字体类型" : "Font Type"}</h3>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFontFamily("serif")}
                      className={`flex-1 py-2 px-4 rounded-lg font-serif text-sm transition-all ${
                        fontFamily === "serif"
                          ? "bg-[#C23E32] text-white"
                          : "bg-stone-100 text-ink-gray hover:bg-stone-200"
                      }`}
                    >
                      {t.fontFamily.serif}
                    </button>
                    <button
                      type="button"
                      onClick={() => setFontFamily("kaiti")}
                      className={`flex-1 py-2 px-4 rounded-lg font-kaiti text-sm transition-all ${
                        fontFamily === "kaiti"
                          ? "bg-[#C23E32] text-white"
                          : "bg-stone-100 text-ink-gray hover:bg-stone-200"
                      }`}
                    >
                      {t.fontFamily.kaiti}
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleFontSettings}
                  className="w-full py-2 bg-stone-100 text-ink-gray hover:bg-stone-200 rounded-lg font-serif text-sm transition-all"
                >
                  {t.close}
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.main>
    </>
  )
}
