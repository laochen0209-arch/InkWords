"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { BookmarkPlus, Play, Type } from "lucide-react"
import { useToast } from "@/components/ink-toast/toast-context"
import { getLanguageSettings, NativeLang, TargetLang } from "@/lib/language-utils"

const UI_TEXT = {
  zh: {
    addToVocabulary: "已加入生词本",
    fontSettings: "字体设置",
    play: "播放",
  },
  en: {
    addToVocabulary: "Added to Vocabulary",
    fontSettings: "Font Settings",
    play: "Play",
  }
}

const novelContent = [
  {
    id: "1",
    english: "When I was six years old I saw a magnificent picture in a book, called True Stories from Nature, about a primeval forest.",
    chinese: "当我六岁的时候，我在一本名为《自然界的真实故事》的书中看到了一幅壮丽的图画，是关于原始森林的。",
  },
  {
    id: "2",
    english: "It was a picture of a boa constrictor in act of swallowing an animal. Here is a copy of drawing.",
    chinese: "那是一幅蟒蛇正在吞食动物的图画。这是那幅画的复制品。",
  },
  {
    id: "3",
    english: "In the book it said: \"Boa constrictors swallow their prey whole, without chewing it. After that they are not able to move, and they sleep through the six months that they need for digestion.\"",
    chinese: "书中写道：\"蟒蛇吞食猎物时，是不咀嚼的。它们吞下猎物后就不能移动，然后睡上六个月来消化。\"",
  },
  {
    id: "4",
    english: "I pondered deeply then over the adventures of the jungle. And after some work with a colored pencil I succeeded in making my first drawing. My Drawing Number One.",
    chinese: "那时我深深地思考着丛林中的冒险。用彩色铅笔画了一会儿后，我成功地画出了我的第一幅画。我的第一号画。",
  },
  {
    id: "5",
    english: "I showed my masterpiece to the grown-ups, and asked them whether the drawing frightened them.",
    chinese: "我把我的杰作拿给大人们看，问他们这幅画是否让他们感到害怕。",
  },
  {
    id: "6",
    english: "But they answered: \"Frighten? Why should any one be frightened by a hat?\" My drawing was not a picture of a hat.",
    chinese: "但他们回答：\"害怕？为什么有人会害怕一顶帽子呢？\"我的画并不是一顶帽子的图画。",
  },
  {
    id: "7",
    english: "It was a picture of a boa constrictor digesting an elephant. But since the grown-ups were not able to understand it, I made another drawing: I drew the inside of the boa constrictor, so that the grown-ups could see it clearly.",
    chinese: "那是一幅蟒蛇正在消化大象的图画。但大人们无法理解它，于是我又画了一幅：我画出了蟒蛇的内部，这样大人们就能清楚地看到了。",
  },
  {
    id: "8",
    english: "They always need to have things explained. My Drawing Number Two looked like this.",
    chinese: "他们总是需要别人解释清楚。我的第二号画是这样的。",
  },
  {
    id: "9",
    english: "The grown-ups' response, this time, was to advise me to lay aside my drawings of boa constrictors, whether from the inside or the outside, and devote myself instead to geography, history, arithmetic and grammar.",
    chinese: "这一次，大人们的反应是建议我放下我的蟒蛇画，无论是内部的还是外部的，转而致力于地理、历史、算术和语法。",
  },
  {
    id: "10",
    english: "That is why, at the age of six, I gave up what might have been a magnificent career as a painter.",
    chinese: "这就是为什么，在六岁的时候，我放弃了我本可能拥有的辉煌画家生涯。",
  },
  {
    id: "11",
    english: "I had been disheartened by the failure of my Drawing Number One and my Drawing Number Two.",
    chinese: "我因为我的第一号画和第二号画的失败而感到沮丧。",
  },
  {
    id: "12",
    english: "Grown-ups never understand anything by themselves, and it is tiresome for children to be always and forever explaining things to them.",
    chinese: "大人们从来不会自己理解任何事情，而孩子们总是要不断地向他们解释事情，这很累人。",
  },
  {
    id: "13",
    english: "So then I chose another profession, and learned to pilot airplanes.",
    chinese: "所以我选择了另一个职业，学会了驾驶飞机。",
  },
  {
    id: "14",
    english: "I have flown a little over all parts of the world; and it is true that geography has been very useful to me.",
    chinese: "我飞遍了世界各地；确实，地理对我非常有用。",
  },
  {
    id: "15",
    english: "At a glance I can distinguish China from Arizona. If one gets lost in the night, such knowledge is valuable.",
    chinese: "一眼我就能分辨出中国和亚利桑那。如果在夜间迷路了，这种知识就很有价值。",
  }
]

export default function NovelReaderPage({ params }: { params: { id: string } }) {
  const toast = useToast()
  const [fontSize, setFontSize] = useState<"base" | "lg" | "xl">("base")
  const [fontFamily, setFontFamily] = useState<"serif" | "kaiti">("serif")
  const [isPlaying, setIsPlaying] = useState<number | null>(null)
  const [showFontSettings, setShowFontSettings] = useState(false)
  const [nativeLang, setNativeLang] = useState<NativeLang>("zh")
  const [targetLang, setTargetLang] = useState<TargetLang>("en")
  const [displayMode, setDisplayMode] = useState<"cn" | "en" | "both">("both")

  const t = UI_TEXT[nativeLang]

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

  const getTitleFontSizeClass = () => {
    switch (fontSize) {
      case "base":
        return "text-2xl md:text-3xl"
      case "lg":
        return "text-3xl md:text-4xl"
      case "xl":
        return "text-4xl md:text-5xl"
      default:
        return "text-2xl md:text-3xl"
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

  const handleAddToVocabulary = () => {
    toast.success(t.addToVocabulary)
  }

  const handleFontSettings = () => {
    setShowFontSettings(!showFontSettings)
  }

  const handlePlay = () => {
    setIsPlaying(isPlaying === null ? 1 : null)
    if (isPlaying === null) {
      if ('speechSynthesis' in window) {
        const text = targetLang === "zh" ? novelContent[0].chinese : novelContent[0].english
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = targetLang === "zh" ? 'zh-CN' : 'en-US'
        speechSynthesis.speak(utterance)
      }
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
                <header className="text-center mb-10">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <span className="px-3 py-1 text-xs rounded-full font-medium bg-ink-vermilion/10 text-ink-vermilion">
                      {targetLang === "zh" ? "小说" : "Fiction"}
                    </span>
                    <span className="px-3 py-1 text-xs rounded-full font-medium bg-ink-paper/50 text-ink-gray">
                      {targetLang === "zh" ? "A2 初级" : "A2 Elementary"}
                    </span>
                  </div>

                  <h1 className={`${getTitleFontSizeClass()} ${fontFamily === 'serif' ? 'font-serif' : 'font-kaiti'} text-ink-black font-semibold tracking-wide mb-4`}>
                    {targetLang === "zh" ? "小王子" : "The Little Prince"}
                  </h1>

                  <p className="text-sm text-ink-gray mb-6">
                    Antoine de Saint-Exupéry
                  </p>

                  <div className="mx-auto w-32 h-px bg-gradient-to-r from-transparent via-ink-gray/40 to-transparent" />
                </header>

                <div className="space-y-8">
                  {novelContent.map((paragraph, index) => (
                    <div key={index} className="mb-8 last:mb-0">
                      {/* 目标语言段落 - 主要阅读内容，大字 */}
                      {(displayMode === "cn" || displayMode === "both") && (
                        <p className={`${getFontSizeClass()} ${getFontFamilyClass()} text-ink-black leading-relaxed tracking-wide`}>
                          {targetLang === "zh" ? paragraph.chinese : paragraph.english}
                        </p>
                      )}

                      {/* 母语言段落 - 辅助参考内容，小字灰阶 */}
                      {(displayMode === "en" || displayMode === "both") && (
                        <p className="text-sm text-gray-500 mt-2 leading-normal font-sans">
                          {targetLang === "zh" ? paragraph.english : paragraph.chinese}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </article>
        </motion.div>

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
      </motion.main>
    </>
  )
}
