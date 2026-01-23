"use client"

import { useState } from "react"
import { StudyCard } from "@/components/study/study-card"
import { ControlButtons } from "@/components/study/control-buttons"
import { NativeLang, TargetLang } from "@/lib/language-utils"

// 示例词汇数据
const sampleWords = [
  { zh: "邂逅", en: "Encounter", pinyin: "xiè hòu", meaning: "to meet by chance; encounter" },
  { zh: "缱绻", en: "Deeply attached", pinyin: "qiǎn quǎn", meaning: "deeply attached; lingering" },
  { zh: "蹁跹", en: "Dance gracefully", pinyin: "pián xiān", meaning: "to dance gracefully" },
  { zh: "氤氲", en: "Misty", pinyin: "yīn yūn", meaning: "misty; hazy atmosphere" },
  { zh: "婉约", en: "Graceful", pinyin: "wǎn yuē", meaning: "graceful and restrained" },
]

type StudyMode = "A" | "B"

export default function StudyPage() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [mode, setMode] = useState<StudyMode>("A")
  const [isPlaying, setIsPlaying] = useState(false)
  const [nativeLang] = useState<NativeLang>("zh")
  const [targetLang] = useState<TargetLang>("en")
  
  const currentWord = sampleWords[currentIndex]
  
  const handleUnknown = () => {
    // 标记为不认识，进入下一个词
    goToNext()
  }
  
  const handleConfirm = () => {
    // 播放发音或确认
    setIsPlaying(true)
    setTimeout(() => setIsPlaying(false), 500)
  }
  
  const handleKnown = () => {
    // 标记为认识，进入下一个词
    goToNext()
  }
  
  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % sampleWords.length)
  }
  
  const handleCorrectInput = () => {
    // 输入正确后的回调
    setTimeout(goToNext, 800)
  }

  return (
    <main className="min-h-screen bg-ink-paper flex flex-col ink-landscape-bg">
      {/* 顶部导航栏 */}
      <header className="flex items-center justify-between px-6 py-5">
        {/* 品牌标识 - 墨语 + 朱砂印章 */}
        <div className="flex items-center gap-2">
          <h1 className="font-serif text-2xl md:text-3xl font-semibold text-[#1a1a1a] tracking-wide">
            墨语
          </h1>
          {/* 朱砂红抽象水墨点 */}
          <span 
            className="w-2.5 h-2.5 md:w-3 md:h-3 bg-ink-vermilion"
            style={{ 
              borderRadius: '60% 40% 50% 45% / 50% 60% 40% 55%',
              transform: 'rotate(-15deg)',
            }}
            aria-hidden="true"
          />
        </div>
        <div className="flex items-center gap-4">
          {/* 模式切换 */}
          <div className="flex items-center gap-2 text-sm text-ink-gray">
            <button
              type="button"
              onClick={() => setMode("A")}
              className={`px-3 py-1 rounded-full transition-colors ${
                mode === "A" 
                  ? "bg-ink-black text-ink-paper" 
                  : "hover:bg-ink-black/5"
              }`}
            >
              识记
            </button>
            <button
              type="button"
              onClick={() => setMode("B")}
              className={`px-3 py-1 rounded-full transition-colors ${
                mode === "B" 
                  ? "bg-ink-black text-ink-paper" 
                  : "hover:bg-ink-black/5"
              }`}
            >
              拼写
            </button>
          </div>
          {/* 进度指示 */}
          <span className="text-sm text-ink-gray">
            {currentIndex + 1} / {sampleWords.length}
          </span>
        </div>
      </header>
      
      {/* 进度条 */}
      <div className="w-full h-[1px] bg-border">
        <div 
          className="h-full bg-ink-vermilion transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / sampleWords.length) * 100}%` }}
        />
      </div>
      
      {/* 主内容区 - 卡片和按钮垂直居中 */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <StudyCard
          key={currentIndex}
          character={currentWord.zh}
          pinyin={currentWord.pinyin}
          meaning={currentWord.meaning}
          mode={mode}
          onCorrectInput={handleCorrectInput}
        />
        
        {/* 底部控制按钮 - 天（圆）- 紧跟卡片下方 */}
        <ControlButtons
          onUnknown={handleUnknown}
          onConfirm={handleConfirm}
          onKnown={handleKnown}
          isPlaying={isPlaying}
        />
      </div>
    </main>
  )
}
