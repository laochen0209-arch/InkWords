"use client"

import { useState } from "react"
import { BookmarkPlus, Play, Type } from "lucide-react"
import { useToast } from "@/components/ink-toast/toast-context"
import { useLanguage } from "@/lib/contexts/language-context"
import { TRANSLATIONS } from "@/lib/i18n"

interface ReaderToolbarProps {
  fontSize?: "base" | "lg" | "xl"
  onFontSizeChange?: (size: "base" | "lg" | "xl") => void
  fontFamily?: "serif" | "kaiti"
  onFontFamilyChange?: (family: "serif" | "kaiti") => void
}

export function ReaderToolbar({ 
  fontSize = "base", 
  onFontSizeChange,
  fontFamily = "serif",
  onFontFamilyChange
}: ReaderToolbarProps) {
  const toast = useToast()
  const [isPlaying, setIsPlaying] = useState(false)
  const [showFontSettings, setShowFontSettings] = useState(false)

  const { learningMode, nativeLang } = useLanguage()

  const t = TRANSLATIONS[learningMode]

  const handleAddToVocabulary = () => {
    toast.success(t.reader.addToVocabulary)
  }

  const handleFontSettings = () => {
    setShowFontSettings(!showFontSettings)
  }

  const handlePlay = () => {
    setIsPlaying(!isPlaying)
    if (!isPlaying) {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance("朗读示例文本")
        utterance.lang = nativeLang === "zh" ? 'zh-CN' : 'en-US'
        speechSynthesis.speak(utterance)
      }
    }
  }

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 w-full h-16 bg-[#FDFBF7]/90 backdrop-blur-md border-t border-stone-100 rounded-none z-50">
        <div className="max-w-2xl mx-auto h-full px-4 flex items-center justify-between">
          <button
            type="button"
            onClick={handleAddToVocabulary}
            className="flex flex-col items-center justify-center gap-1 w-20 h-full text-ink-gray hover:text-ink-black transition-all duration-200 active:scale-95"
            aria-label={t.reader.addToVocabulary}
          >
            <BookmarkPlus className="w-5 h-5" strokeWidth={1.5} />
            <span className="text-xs">{nativeLang === "zh" ? "生词本" : "Vocabulary"}</span>
          </button>
          
          <button
            type="button"
            onClick={handlePlay}
            className="flex items-center justify-center w-14 h-14 rounded-full bg-[#C23E32] hover:bg-[#A33428] active:scale-95 transition-all duration-200 shadow-md"
            aria-label={t.reader.play}
          >
            <Play className="w-6 h-6 text-white ml-1" fill="white" strokeWidth={0} />
          </button>
          
          <button
            type="button"
            onClick={handleFontSettings}
            className="flex flex-col items-center justify-center gap-1 w-20 h-full text-ink-gray hover:text-ink-black transition-all duration-200 active:scale-95"
            aria-label={t.reader.fontSettings}
          >
            <Type className="w-5 h-5" strokeWidth={1.5} />
            <span className="text-xs">{nativeLang === "zh" ? "字体" : "Font"}</span>
          </button>
        </div>
      </div>

      {showFontSettings && (
        <div 
          className="fixed bottom-20 left-0 right-0 z-40 px-4"
          role="dialog"
          aria-label={t.reader.fontSettings}
        >
          <div className="max-w-2xl mx-auto bg-[#FDFBF7]/95 backdrop-blur-md border border-stone-200/30 rounded-lg shadow-lg p-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-serif text-ink-black mb-2">{nativeLang === "zh" ? "字体大小" : "Font Size"}</h3>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onFontSizeChange?.("base")}
                    className={`flex-1 py-2 px-4 rounded-lg font-serif text-sm transition-all ${
                      fontSize === "base"
                        ? "bg-[#C23E32] text-white"
                        : "bg-stone-100 text-ink-gray hover:bg-stone-200"
                    }`}
                  >
                    {t.reader.fontSize.base}
                  </button>
                  <button
                    type="button"
                    onClick={() => onFontSizeChange?.("lg")}
                    className={`flex-1 py-2 px-4 rounded-lg font-serif text-sm transition-all ${
                      fontSize === "lg"
                        ? "bg-[#C23E32] text-white"
                        : "bg-stone-100 text-ink-gray hover:bg-stone-200"
                    }`}
                  >
                    {t.reader.fontSize.lg}
                  </button>
                  <button
                    type="button"
                    onClick={() => onFontSizeChange?.("xl")}
                    className={`flex-1 py-2 px-4 rounded-lg font-serif text-sm transition-all ${
                      fontSize === "xl"
                        ? "bg-[#C23E32] text-white"
                        : "bg-stone-100 text-ink-gray hover:bg-stone-200"
                    }`}
                  >
                    {t.reader.fontSize.xl}
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-serif text-ink-black mb-2">{nativeLang === "zh" ? "字体类型" : "Font Type"}</h3>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onFontFamilyChange?.("serif")}
                    className={`flex-1 py-2 px-4 rounded-lg font-serif text-sm transition-all ${
                      fontFamily === "serif"
                        ? "bg-[#C23E32] text-white"
                        : "bg-stone-100 text-ink-gray hover:bg-stone-200"
                    }`}
                  >
                    {t.reader.fontFamily.serif}
                  </button>
                  <button
                    type="button"
                    onClick={() => onFontFamilyChange?.("kaiti")}
                    className={`flex-1 py-2 px-4 rounded-lg font-kaiti text-sm transition-all ${
                      fontFamily === "kaiti"
                        ? "bg-[#C23E32] text-white"
                        : "bg-stone-100 text-ink-gray hover:bg-stone-200"
                    }`}
                  >
                    {t.reader.fontFamily.kaiti}
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleFontSettings}
                className="w-full py-2 bg-stone-100 text-ink-gray hover:bg-stone-200 rounded-lg font-serif text-sm transition-all"
              >
                {t.reader.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
