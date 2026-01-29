"use client"

import { useState, useCallback } from "react"
import { cn } from "@/lib/utils"

interface ClickToSpeakProps {
  text: string
  isEnglish: boolean
  fontSize?: "base" | "lg" | "xl"
  onSpeakStart?: () => void
  onSpeakEnd?: () => void
}

export function ClickToSpeak({ 
  text, 
  isEnglish,
  fontSize = "base",
  onSpeakStart,
  onSpeakEnd
}: ClickToSpeakProps) {
  const [isSpeaking, setIsSpeaking] = useState(false)

  const getFontSizeClass = () => {
    switch (fontSize) {
      case "base":
        return isEnglish ? "text-lg md:text-xl" : "text-sm md:text-base"
      case "lg":
        return isEnglish ? "text-xl md:text-2xl" : "text-base md:text-lg"
      case "xl":
        return isEnglish ? "text-2xl md:text-3xl" : "text-lg md:text-xl"
      default:
        return isEnglish ? "text-lg md:text-xl" : "text-sm md:text-base"
    }
  }

  const getFontFamilyClass = () => {
    return isEnglish ? "font-serif" : "font-sans"
  }

  const handleSpeak = useCallback(() => {
    if (!isEnglish || isSpeaking) return

    setIsSpeaking(true)
    onSpeakStart?.()

    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-US'
      utterance.rate = 0.9
      utterance.pitch = 1

      utterance.onend = () => {
        setIsSpeaking(false)
        onSpeakEnd?.()
      }

      utterance.onerror = () => {
        setIsSpeaking(false)
        onSpeakEnd?.()
      }

      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(utterance)
    }
  }, [text, isEnglish, isSpeaking, onSpeakStart, onSpeakEnd])

  return (
    <p
      onClick={handleSpeak}
      className={cn(
        "leading-relaxed tracking-wide transition-all duration-200",
        getFontSizeClass(),
        getFontFamilyClass(),
        isEnglish
          ? "text-ink-black cursor-pointer hover:bg-gray-100 active:bg-gray-200 rounded-lg px-3 py-2 -mx-3"
          : "text-gray-500",
        isSpeaking && "bg-yellow-200"
      )}
    >
      {text}
    </p>
  )
}
