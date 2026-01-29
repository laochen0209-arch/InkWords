"use client"

import React from "react"
import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ink-toast/toast-context"
import { Volume2 } from "lucide-react"
import { NativeLang, TargetLang } from "@/lib/language-utils"
import { useTTS } from "@/lib/hooks/use-tts"

interface StudyCardProps {
  zh: string
  en: string
  pinyin: string
  meaning: string
  en_hint?: string
  py_hint?: string
  example?: string
  examplePinyin?: string
  exampleMeaning?: string
  mode: "A" | "B" | "C"
  nativeLang: NativeLang
  targetLang: TargetLang
  learningMode: "LEARN_CHINESE" | "LEARN_ENGLISH"
  showHint?: boolean
  onHintToggle?: () => void
  onCorrectInput?: () => void
  onError?: () => void
  onInputStateChange?: (isError: boolean) => void
}

/**
 * 单词卡片组件
 * 展示中文单词，根据学习模式要求用户输入英文或拼音
 */
export function StudyCard({ 
  zh, 
  en,
  pinyin, 
  meaning,
  en_hint,
  py_hint,
  example,
  examplePinyin,
  exampleMeaning,
  mode,
  nativeLang,
  targetLang,
  learningMode,
  showHint,
  onHintToggle,
  onCorrectInput,
  onError,
  onInputStateChange
}: StudyCardProps) {
  const [showMeaning, setShowMeaning] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [isCorrect, setIsCorrect] = useState(false)
  const [isError, setIsError] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { success, error } = useToast()
  const { isPlaying, speak, stop } = useTTS({ learningMode })

  /**
   * 智能双模显示逻辑：根据学习模式动态计算显示内容
   */
  const getDynamicContent = () => {
    let questionText = ""
    let hintText = ""
    let targetAnswer = ""
    let inputPlaceholder = ""

    if (learningMode === 'LEARN_ENGLISH') {
      questionText = en
      hintText = zh
      targetAnswer = en
      inputPlaceholder = "请输入英文..."
    } else {
      questionText = zh
      hintText = en
      targetAnswer = pinyin
      inputPlaceholder = "Enter Pinyin..."
    }

    return { questionText, hintText, targetAnswer, inputPlaceholder }
  }

  const { questionText, hintText, targetAnswer, inputPlaceholder } = getDynamicContent()

  /**
   * 根据学习模式获取目标答案（使用动态计算）
   */
  const getTargetAnswer = () => {
    return targetAnswer
  }

  /**
   * 根据学习模式获取提示（使用动态计算）
   */
  const getHint = () => {
    return learningMode === 'LEARN_ENGLISH' ? en_hint : py_hint
  }

  /**
   * 根据学习模式获取输入框占位符（使用动态计算）
   */
  const getPlaceholder = () => {
    return inputPlaceholder
  }

  /**
   * 根据学习模式获取成功提示文本
   */
  const getSuccessMessage = () => {
    return learningMode === 'LEARN_ENGLISH' ? "英文正确！" : "拼音正确！"
  }

  /**
   * 根据学习模式获取错误提示文本
   */
  const getErrorMessage = () => {
    return learningMode === 'LEARN_ENGLISH' ? `正确英文：${en}` : `正确拼音：${pinyin}`
  }

  /**
   * 播放发音
   */
  const handlePlayAudio = () => {
    const text = learningMode === 'LEARN_ENGLISH' ? en : zh
    speak(text)
  }

  /**
   * 当切换模式时，自动聚焦输入框
   */
  useEffect(() => {
    if (mode === "B") {
      setShowAnswer(false)
      setInputValue("")
      setIsCorrect(false)
      setIsError(false)
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    } else {
      setShowAnswer(true)
      setInputValue("")
      setIsCorrect(false)
      setIsError(false)
    }
  }, [mode, learningMode])

  /**
   * 通知父组件输入状态变化
   */
  useEffect(() => {
    onInputStateChange?.(isError)
  }, [isError, onInputStateChange])

  /**
   * 检查输入是否正确
   */
  const checkInput = (value: string) => {
    const targetAnswer = getTargetAnswer()
    
    if (learningMode === 'LEARN_ENGLISH') {
      const normalizedInput = value.toLowerCase().trim().replace(/[.,!?;:'"()\-]/g, "")
      const normalizedAnswer = targetAnswer.toLowerCase().replace(/[.,!?;:'"()\-]/g, "")
      
      if (normalizedInput === normalizedAnswer) {
        setIsCorrect(true)
        setIsError(false)
        success(getSuccessMessage())
        setInputValue("")
        onCorrectInput?.()
        return true
      }
    } else {
      const normalizedInput = value.toLowerCase().trim()
      const normalizedPinyin = pinyin.toLowerCase().replace(/[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/g, (char) => {
        const map: Record<string, string> = {
          'ā': 'a', 'á': 'a', 'ǎ': 'a', 'à': 'a',
          'ē': 'e', 'é': 'e', 'ě': 'e', 'è': 'e',
          'ī': 'i', 'í': 'i', 'ǐ': 'i', 'ì': 'i',
          'ō': 'o', 'ó': 'o', 'ǒ': 'o', 'ò': 'o',
          'ū': 'u', 'ú': 'u', 'ǔ': 'u', 'ù': 'u',
          'ǖ': 'v', 'ǘ': 'v', 'ǚ': 'v', 'ǜ': 'v',
        }
        return map[char] || char
      }).replace(/\s+/g, '')
      
      if (normalizedInput === normalizedPinyin) {
        setIsCorrect(true)
        setIsError(false)
        success(getSuccessMessage())
        setInputValue("")
        onCorrectInput?.()
        return true
      }
    }
    return false
  }

  /**
   * 处理输入变化
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    setIsError(false)
    checkInput(value)
  }

  /**
   * 处理键盘事件
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const isCorrect = checkInput(inputValue)
      if (!isCorrect && inputValue.trim() !== "") {
        setIsError(true)
        error(getErrorMessage())
        setShowAnswer(true)
        onError?.()
        setTimeout(() => {
          setShowAnswer(false)
          setIsError(false)
        }, 2500)
      } else if (isCorrect) {
        setInputValue("")
        setTimeout(() => {
          inputRef.current?.focus()
        }, 100)
      }
    }
  }

  /**
   * 切换提示显示
   */
  const handleToggleHint = () => {
    setShowMeaning(!showMeaning)
  }

  return (
    <div 
      className="relative w-full max-w-[320px] bg-white/90 shadow-lg rounded-xl"
    >
      <div className="flex flex-col items-center justify-between p-6">
        {/* 主展示区 - 大号题目（使用动态计算的 questionText） */}
        <div className="flex-1 flex items-center justify-center w-full mb-3 px-4">
          <h1
            className={cn(
              "font-serif text-2xl md:text-3xl lg:text-4xl font-semibold text-[#C23E32] break-words whitespace-normal w-full text-center leading-tight",
              isCorrect && "text-green-600"
            )}
          >
            {questionText}
          </h1>
        </div>

        {/* 播放发音按钮 */}
        <button
          type="button"
          onClick={handlePlayAudio}
          className="flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-ink-vermilion transition-colors"
        >
          <Volume2 
            className={cn(
              "w-4 h-4 transition-all duration-300",
              isPlaying && "animate-pulse text-ink-vermilion"
            )}
          />
          {nativeLang === "zh" ? "播放" : "Play"}
        </button>
      </div>

      {/* 辅助解析区 - 小字提示（强制始终显示） */}
      <div className="w-full mb-4 px-6">
        <p
          className="text-center text-base text-gray-500 font-sans leading-relaxed"
        >
          {hintText}
        </p>
      </div>

      {/* 答案展示区（观摩模式或显示答案时） */}
      <div className="w-full mb-4 px-6">
        <p
          className={cn(
            "text-center text-xl md:text-2xl text-gray-600 font-sans leading-relaxed transition-opacity duration-300",
            mode === "A" || showAnswer ? "opacity-100" : "opacity-0"
          )}
        >
          {learningMode === 'LEARN_ENGLISH' ? en : pinyin}
        </p>
      </div>

      {/* 参考翻译展示区（观摩模式或显示答案时，小字号作为参考） */}
      <div className="w-full mb-4 px-6">
        <p
          className={cn(
            "text-center text-sm text-gray-400 font-sans leading-relaxed transition-opacity duration-300",
            mode === "A" || showAnswer ? "opacity-100" : "opacity-0"
          )}
        >
          {nativeLang === "zh" ? pinyin : en}
        </p>
      </div>

      {/* 重点词语展示区（观摩模式） */}
      {mode === "A" && (
        <div className="px-6 py-4 bg-gradient-to-br from-[#C23E32]/5 to-[#A8352B]/5 rounded-lg mx-4 mb-4">
          <h3 className="text-center text-sm font-serif text-ink-vermilion mb-2">
            {nativeLang === "zh" ? "重点词语" : "Key Words"}
          </h3>
          <p className="text-center text-base font-serif text-ink-black leading-relaxed">
            {nativeLang === "zh" ? zh : en}
          </p>
        </div>
      )}

      {/* 输入区（默写模式） */}
      {mode === "B" && (
        <div className="w-full relative px-6">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={getPlaceholder()}
            className={cn(
              "w-full px-4 py-3 text-center font-sans text-lg",
              "bg-transparent border-b-2 border-gray-300 rounded-none",
              "placeholder:text-gray-400",
              "focus:outline-none focus:border-[#C23E32] focus:ring-2 focus:ring-[#C23E32]/20",
              "transition-all duration-200",
              isCorrect && "border-green-600 text-green-600 focus:border-green-600 focus:ring-green-600/20",
              isError && "border-[#C23E32] text-[#C23E32] focus:border-[#C23E32] focus:ring-[#C23E32]/20"
            )}
            autoFocus
          />
        </div>
      )}
      
      {example && (
        <div className="mt-4 pt-4 border-t border-gray-200 px-6 pb-6">
          <div className="space-y-2">
            <p className="text-sm text-gray-600 italic font-serif leading-relaxed">
              {example}
            </p>
            
            {examplePinyin && (
              <p className="text-xs text-gray-400 font-sans italic">
                {examplePinyin}
              </p>
            )}
            
            {exampleMeaning && (
              <p className="text-xs text-gray-400 font-sans italic">
                {exampleMeaning}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
