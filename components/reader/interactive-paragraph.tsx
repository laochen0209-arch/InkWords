"use client"

import { useState, useMemo } from "react"
import { Volume2 } from "lucide-react"

interface InteractiveParagraphProps {
  text: string
  lang?: string
  fontSize?: "base" | "lg" | "xl"
  fontFamily?: "serif" | "kaiti"
}

export function InteractiveParagraph({ 
  text, 
  lang = "en-US",
  fontSize = "base",
  fontFamily = "serif"
}: InteractiveParagraphProps) {
  const [playingIndex, setPlayingIndex] = useState<number | null>(null)

  /**
   * 智能分句逻辑
   * 使用正则表达式匹配句子，保留标点和后面的空格
   */
  const sentences = useMemo(() => {
    if (!text || text.trim() === "") {
      return []
    }

    const matches = text.match(/[^.!?]+[.!?]+["']?\s*/g)
    
    if (matches && matches.length > 0) {
      return matches.map((s, i) => ({
        id: i,
        text: s.trim()
      }))
    }
    
    return [{ id: 0, text: text.trim() }]
  }, [text])

  /**
   * 播放逻辑
   */
  const playSentence = (sentence: string, index: number) => {
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(sentence)
    utterance.lang = lang
    utterance.rate = 0.9

    utterance.onstart = () => setPlayingIndex(index)
    utterance.onend = () => setPlayingIndex(null)
    utterance.onerror = () => setPlayingIndex(null)

    window.speechSynthesis.speak(utterance)
  }

  /**
   * 样式映射
   */
  const sizeClass = fontSize === 'xl' ? 'text-2xl' : fontSize === 'lg' ? 'text-xl' : 'text-lg';
  const fontClass = fontFamily === 'kaiti' ? 'font-kaiti' : 'font-serif';

  if (sentences.length === 0) {
    return null
  }

  return (
    <div className={`leading-loose text-stone-800 ${sizeClass} ${fontClass}`}>
      {sentences.map((sentence) => (
        <span
          key={sentence.id}
          onClick={(e) => {
            e.stopPropagation()
            playSentence(sentence.text, sentence.id);
          }}
          className={`cursor-pointer rounded px-1 py-0.5 transition-colors duration-200 select-text ${
            playingIndex === sentence.id 
              ? "bg-amber-200 text-amber-900 shadow-sm" 
              : "hover:bg-stone-100 hover:text-amber-700"
          }`}
          role="button"
          tabIndex={0}
        >
          {sentence.text} 
          {playingIndex === sentence.id && (
            <Volume2 className="inline-block ml-1 w-4 h-4 text-amber-600 animate-pulse" />
          )}
        </span>
      ))}
    </div>
  )
}
