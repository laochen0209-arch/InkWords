"use client"

import { useEffect } from "react"
import { X, Volume2, BookmarkPlus } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { VocabularyWord } from "@/lib/types/article"
import { useToast } from "@/components/ink-toast/toast-context"

/**
 * 生词弹窗组件属性
 */
interface WordPopupProps {
  isOpen: boolean
  word: VocabularyWord | null
  onClose: () => void
  onAddToVocabulary?: (word: VocabularyWord) => void
}

/**
 * 生词弹窗组件
 * 显示单词的详细信息，包括发音、释义和例句
 */
export function WordPopup({ isOpen, word, onClose, onAddToVocabulary }: WordPopupProps) {
  const toast = useToast()

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }

    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

  const handlePlayPronunciation = () => {
    if (!word) return

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(word.word)
      utterance.lang = "en-US"
      utterance.rate = 0.8
      window.speechSynthesis.speak(utterance)
    }
  }

  const handleAddToVocabulary = () => {
    if (!word) return

    onAddToVocabulary?.(word)
    toast.success("已加入生词本")
  }

  if (!word) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-full max-w-md"
          >
            <div className="bg-[#FDFBF7] rounded-2xl shadow-2xl border border-stone-200/50 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-serif text-2xl font-bold text-ink-black mb-1">
                      {word.word}
                    </h3>
                    <p className="text-sm text-ink-gray/60 font-mono">
                      {word.pronunciation}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-stone-100 transition-colors"
                    aria-label="关闭"
                  >
                    <X className="w-5 h-5 text-ink-gray" strokeWidth={1.5} />
                  </button>
                </div>

                <div className="mb-4">
                  <p className="text-base text-ink-black/90 leading-relaxed">
                    {word.meaning}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-[#C23E32]/5 to-[#A8352B]/5 rounded-xl p-4 mb-4">
                  <p className="text-sm text-ink-gray/70 mb-1 font-medium">
                    例句
                  </p>
                  <p className="text-base text-ink-black/80 leading-relaxed font-serif">
                    {word.context_sentence}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handlePlayPronunciation}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-ink-vermilion text-white hover:bg-[#A33428] transition-all duration-200 font-medium"
                  >
                    <Volume2 className="w-5 h-5" strokeWidth={1.5} />
                    <span>发音</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAddToVocabulary}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-stone-100 text-ink-black hover:bg-stone-200 transition-all duration-200 font-medium"
                  >
                    <BookmarkPlus className="w-5 h-5" strokeWidth={1.5} />
                    <span>生词本</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
