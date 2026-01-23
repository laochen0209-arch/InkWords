"use client"

import { useState } from "react"
import { ArrowLeft, Volume2, X, BookOpen } from "lucide-react"
import Link from "next/link"

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

export default function VocabularyPage() {
  const [words, setWords] = useState<WordItem[]>(mockWords)
  
  const totalCount = words.length
  const masteredCount = words.filter(w => w.mastered).length
  
  const handleRemove = (id: string) => {
    setWords(prev => prev.filter(w => w.id !== id))
  }
  
  const handlePlay = (word: string) => {
    // 模拟播放发音
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word)
      utterance.lang = 'en-US'
      speechSynthesis.speak(utterance)
    }
  }

  return (
    <>
      {/* Layer 1: 固定背景层 - 水墨山水 */}
      <div 
        className="fixed inset-0 z-0 bg-ink-paper ink-landscape-bg"
        aria-hidden="true"
      />
      
      {/* Layer 2: 可滚动内容区 - 隐藏滚动条 */}
      <main className="relative z-10 min-h-screen overflow-y-auto scrollbar-hide">
        {/* 固定顶部栏 - 全宽 */}
        <header className="fixed top-0 left-0 right-0 z-40 w-full h-14 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-stone-200/50">
          <div className="h-full w-full max-w-2xl mx-auto px-4 flex items-center">
            {/* 返回按钮 */}
            <Link 
              href="/"
              className="w-10 h-10 flex items-center justify-center text-ink-black hover:text-ink-vermilion transition-colors"
              aria-label="返回"
            >
              <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
            </Link>
            
            {/* 标题 */}
            <h1 className="flex-1 text-center font-serif text-lg text-ink-black pr-10">
              生词本
            </h1>
          </div>
        </header>
        
        {/* 内容区 - 移动端全宽铺满，桌面端居中限制宽度 */}
        <div className="w-full min-h-screen bg-[#FDFBF7]/70 pt-14 pb-8 md:bg-transparent md:min-h-0 md:max-w-2xl md:mx-auto md:my-8 md:rounded-xl md:shadow-[0_4px_20px_rgba(43,43,43,0.08)]">
          {/* 顶部统计条 */}
          <div className="px-4 py-4">
            <div className="bg-[#FDFBF7]/80 backdrop-blur-sm px-4 py-3 border border-stone-200/30 md:bg-stone-100/50">
              <p className="text-center text-sm text-ink-gray font-serif">
                共收藏 <span className="text-ink-black font-medium">{totalCount}</span> 词
                <span className="mx-3 text-stone-300">·</span>
                已掌握 <span className="text-ink-bamboo font-medium">{masteredCount}</span> 词
              </p>
            </div>
          </div>
          
          {/* 单词列表 */}
          {words.length > 0 ? (
            <div className="px-4 space-y-3">
              {words.map((item) => (
                <div 
                  key={item.id}
                  className="bg-[#FDFBF7] md:bg-[#FDFBF7]/90 backdrop-blur-sm border border-stone-200/30 shadow-[0_2px_8px_rgba(43,43,43,0.04)] p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* 左侧：单词信息 */}
                    <div className="flex-1 min-w-0">
                      {/* 单词 */}
                      <h3 className="font-serif text-xl text-ink-black leading-tight">
                        {item.word}
                      </h3>
                      {/* 音标 */}
                      <p className="mt-1 text-sm text-ink-gray/70 font-mono">
                        {item.phonetic}
                      </p>
                      {/* 中文释义 */}
                      <p className="mt-2 text-sm text-ink-gray leading-relaxed">
                        {item.translation}
                      </p>
                      {/* 掌握标签 */}
                      {item.mastered && (
                        <span className="inline-block mt-2 px-2 py-0.5 text-xs font-serif text-ink-bamboo bg-ink-bamboo/10 border border-ink-bamboo/20">
                          已掌握
                        </span>
                      )}
                    </div>
                    
                    {/* 右侧：操作按钮 */}
                    <div className="flex flex-col gap-2">
                      {/* 播放按钮 */}
                      <button
                        type="button"
                        onClick={() => handlePlay(item.word)}
                        className="w-9 h-9 flex items-center justify-center text-ink-gray hover:text-ink-vermilion hover:bg-ink-vermilion/5 transition-colors"
                        aria-label={`播放 ${item.word} 的发音`}
                      >
                        <Volume2 className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                      
                      {/* 移除按钮 */}
                      <button
                        type="button"
                        onClick={() => handleRemove(item.id)}
                        className="w-9 h-9 flex items-center justify-center text-ink-gray/50 hover:text-ink-vermilion hover:bg-ink-vermilion/5 transition-colors"
                        aria-label={`从生词本移除 ${item.word}`}
                      >
                        <X className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* 空状态 */
            <div className="px-4 py-20">
              <div className="flex flex-col items-center justify-center text-center">
                {/* 水墨笔触图标 */}
                <div className="w-20 h-20 flex items-center justify-center opacity-20">
                  <BookOpen className="w-16 h-16 text-ink-gray" strokeWidth={0.5} />
                </div>
                <p className="mt-6 font-serif text-ink-gray/60 text-base">
                  暂无生词
                </p>
                <p className="mt-2 text-sm text-ink-gray/40">
                  阅读文章时，点击单词可添加到生词本
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
