"use client"

import { Volume2 } from "lucide-react"
import { motion } from "framer-motion"
import { NativeLang, TargetLang } from "@/lib/language-utils"
import { useLanguage } from "@/lib/contexts/language-context"
import { TRANSLATIONS } from "@/lib/i18n"
import { InteractiveParagraph } from "./interactive-paragraph"

interface ReaderContentProps {
  fontSize?: "base" | "lg" | "xl"
  fontFamily?: "serif" | "kaiti"
  displayMode?: "cn" | "en" | "both"
  english?: string
  chinese?: string
  isPlaying?: number | null
  nativeLang?: NativeLang
  targetLang?: TargetLang
}

export function ReaderContent({ 
  fontSize = "base", 
  fontFamily = "serif",
  displayMode = "both",
  english,
  chinese,
  isPlaying = null,
  nativeLang = "zh",
  targetLang = "en"
}: ReaderContentProps) {
  const { learningMode } = useLanguage()

  const t = TRANSLATIONS[learningMode]

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

  const englishParagraphs = english ? english.split('\n') : []
  const chineseParagraphs = chinese ? chinese.split('\n') : []
  const maxParagraphs = Math.max(englishParagraphs.length, chineseParagraphs.length)

  /**
   * 强制双语渲染逻辑：
   * - 无论什么模式，文章正文必须渲染双语（一段中文，一段英文）
   * - 如果 learningMode === 'LEARN_ENGLISH'（国人），则中文（母语）大字在前，英文小字在后
   * - 如果 learningMode === 'LEARN_CHINESE'（外国人），则英文（母语）大字在前，中文小字在后
   */
  const getMainContent = (index: number) => {
    return learningMode === "LEARN_ENGLISH" ? chineseParagraphs[index] : englishParagraphs[index]
  }

  const getAuxContent = (index: number) => {
    return learningMode === "LEARN_ENGLISH" ? englishParagraphs[index] : chineseParagraphs[index]
  }

  return (
    <article className="w-full md:max-w-2xl md:mx-auto md:px-4">
      {/* 信笺容器 - 移动端全宽铺满无圆角无阴影，桌面端居中卡片模式 */}
      <div className="w-full min-h-screen bg-[#FDFBF7]/90 rounded-none shadow-none md:min-h-0 md:rounded-sm md:shadow-[0_4px_20px_rgba(43,43,43,0.08)] md:my-8">
        {/* 内容区 */}
        <div className="p-8 md:p-12">
          {/* 文章头部 */}
          <header className="text-center mb-10">
            <h1 className={`${getFontSizeClass()} ${getFontFamilyClass()} text-ink-black font-semibold tracking-wide mb-4`}>
              {targetLang === "zh" ? "静夜思" : "Quiet Night Thought"}
            </h1>
            <p className="text-sm text-ink-gray">
              {targetLang === "zh" ? "李白" : "Li Bai"}
            </p>
            {/* 水墨分隔线 */}
            <div className="mt-6 mx-auto w-32 h-px bg-gradient-to-r from-transparent via-ink-gray/40 to-transparent" />
          </header>
          
          {/* 正文段落 - 强制双语渲染 */}
          <div className="space-y-8">
            {Array.from({ length: maxParagraphs }).map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                <div 
                  className={
                    isPlaying !== null 
                      ? "relative -mx-4 px-4 py-3 bg-stone-200/50 transition-colors duration-300" 
                      : "relative"
                  }
                >
                  {/* 主展示内容 - 大字 - 使用 InteractiveParagraph 组件实现点击即读 */}
                  {getMainContent(index) && (
                    <InteractiveParagraph 
                      text={getMainContent(index) || ""}
                      lang={targetLang === "zh" ? "zh-CN" : "en-US"}
                      fontSize={fontSize}
                      fontFamily={fontFamily}
                    />
                  )}
                  
                  {/* 辅助解析 - 小字灰阶 */}
                  {getAuxContent(index) && (
                    <p className={`mt-3 text-sm text-stone-500 leading-relaxed break-words ${getFontFamilyClass()}`}>
                      {getAuxContent(index)}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </article>
  )
}
