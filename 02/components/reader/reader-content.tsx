"use client"

import { Volume2 } from "lucide-react"

interface Paragraph {
  id: number
  english: string
  chinese: string
  isPlaying?: boolean
}

const articleContent: Paragraph[] = [
  {
    id: 1,
    english: "Once when I was six years old I saw a magnificent picture in a book, called True Stories from Nature, about the primeval forest.",
    chinese: "当我还只有六岁的时候，在一本描写原始森林的名叫《真实的故事》的书中，看到了一幅精彩的插画。",
    isPlaying: false,
  },
  {
    id: 2,
    english: "It was a picture of a boa constrictor in the act of swallowing an animal.",
    chinese: "那是一幅画着一条大蟒蛇正在吞食一只野兽的图画。",
    isPlaying: true, // 当前正在朗读的句子
  },
  {
    id: 3,
    english: "In the book it said: \"Boa constrictors swallow their prey whole, without chewing it. After that they are not able to move, and they sleep through the six months that they need for digestion.\"",
    chinese: "书上这样写道：「蟒蛇把它们的猎物整个吞下去，一口也不嚼。然后它们就不能再动弹了，需要睡上六个月来消化食物。」",
    isPlaying: false,
  },
  {
    id: 4,
    english: "I pondered deeply, then, over the adventures of the jungle. And after some work with a colored pencil I succeeded in making my first drawing.",
    chinese: "那时，我对丛林中的奇遇想得很多，于是，我也用彩色铅笔画出了我的第一幅图画。",
    isPlaying: false,
  },
  {
    id: 5,
    english: "I showed my masterpiece to the grown-ups, and asked them whether the drawing frightened them.",
    chinese: "我把我的这副杰作拿给大人们看，我问他们我的画是否使他们感到害怕。",
    isPlaying: false,
  },
]

export function ReaderContent() {
  return (
    <article className="w-full md:max-w-2xl md:mx-auto md:px-4">
      {/* 信笺容器 - 移动端全宽铺满无圆角无阴影，桌面端居中卡片模式 */}
      <div className="w-full min-h-screen bg-[#FDFBF7]/90 rounded-none shadow-none md:min-h-0 md:rounded-sm md:shadow-[0_4px_20px_rgba(43,43,43,0.08)] md:my-8">
        {/* 内容区 */}
        <div className="p-8 md:p-12">
          {/* 文章头部 */}
          <header className="text-center mb-10">
            <h1 className="font-serif text-2xl md:text-3xl text-ink-black font-semibold tracking-wide mb-4">
              小王子
            </h1>
            <p className="text-sm text-ink-gray">
              《Le Petit Prince》 · Antoine de Saint-Exupéry
            </p>
            {/* 水墨分隔线 */}
            <div className="mt-6 mx-auto w-32 h-px bg-gradient-to-r from-transparent via-ink-gray/40 to-transparent" />
          </header>
          
          {/* 正文段落 */}
          <div className="space-y-8">
            {articleContent.map((paragraph) => (
              <div 
                key={paragraph.id}
                className={
                  paragraph.isPlaying 
                    ? "relative -mx-4 px-4 py-3 bg-stone-200/50 transition-colors duration-300" 
                    : "relative"
                }
              >
                {/* 英文原文 */}
                <p className="font-serif text-lg text-ink-black leading-loose tracking-wide">
                  {paragraph.english}
                  {/* 朗读图标 */}
                  {paragraph.isPlaying && (
                    <Volume2 
                      className="inline-block ml-2 w-4 h-4 text-ink-vermilion animate-pulse" 
                      aria-label="正在朗读"
                    />
                  )}
                </p>
                
                {/* 中文译文 */}
                <p className="mt-3 text-sm text-stone-500 leading-relaxed">
                  {paragraph.chinese}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </article>
  )
}
