"use client"

import { Volume2, X } from "lucide-react"
import { motion } from "framer-motion"

interface WordItem {
  id: string
  word: string
  phonetic: string
  translation: string
  mastered: boolean
}

interface VocabularyCardProps {
  item: WordItem
  onRemove: (id: string) => void
}

export function VocabularyCard({ item, onRemove }: VocabularyCardProps) {
  const handlePlay = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(item.word)
      utterance.lang = 'en-US'
      speechSynthesis.speak(utterance)
    }
  }

  return (
    <div className="bg-[#FDFBF7] md:bg-[#FDFBF7]/90 backdrop-blur-sm border border-stone-200/30 shadow-[0_2px_8px_rgba(43,43,43,0.04)] p-4 relative overflow-hidden">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0 w-full">
          <h3 className="font-serif text-xl text-ink-black leading-tight truncate">
            {item.word}
          </h3>
          <p className="mt-1 text-sm text-ink-gray/70 font-mono break-words">
            {item.phonetic}
          </p>
          <p className="mt-2 text-sm text-ink-gray leading-relaxed break-words">
            {item.translation}
          </p>
          {item.mastered && (
            <span className="inline-block mt-2 px-2 py-0.5 text-xs font-serif text-ink-bamboo bg-ink-bamboo/10 border border-ink-bamboo/20">
              已掌握
            </span>
          )}
        </div>
        
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={handlePlay}
            className="w-9 h-9 flex items-center justify-center text-ink-gray hover:text-white hover:bg-[#C23E32] transition-colors duration-150 cursor-pointer"
            aria-label={`播放 ${item.word} 的发音`}
          >
            <Volume2 className="w-4 h-4" strokeWidth={1.5} />
          </button>
          
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            className="w-9 h-9 flex items-center justify-center text-ink-gray/50 hover:text-white hover:bg-[#C23E32] transition-colors duration-150 cursor-pointer"
            aria-label={`从生词本移除 ${item.word}`}
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  )
}
