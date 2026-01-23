"use client"

import React from "react"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface StudyCardProps {
  character: string
  pinyin: string
  meaning: string
  mode: "A" | "B"
  onCorrectInput?: () => void
}

export function StudyCard({ 
  character, 
  pinyin, 
  meaning, 
  mode,
  onCorrectInput 
}: StudyCardProps) {
  const [showMeaning, setShowMeaning] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [isCorrect, setIsCorrect] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    
    // 检查拼音是否正确（忽略声调和大小写）
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
      onCorrectInput?.()
    }
  }

  return (
    <div 
      className="relative w-full max-w-[320px] aspect-[3/4] bg-ink-paper border border-border"
      style={{ boxShadow: 'var(--shadow-ink)' }}
    >
      {/* 卡片内容 */}
      <div className="flex flex-col items-center justify-between h-full px-6 py-8">
        {/* 顶部：汉字 */}
        <div className="flex-1 flex items-center justify-center">
          <h1 
            className={cn(
              "font-serif text-7xl font-semibold text-ink-black tracking-wider transition-colors duration-300",
              isCorrect && "text-ink-bamboo"
            )}
          >
            {character}
          </h1>
        </div>
        
        {/* 中间：拼音 */}
        <div className="py-4">
          <p className="text-xl text-ink-gray font-sans tracking-wide">
            {pinyin}
          </p>
        </div>
        
        {/* 底部：英文释义（默认隐藏）+ 输入框 */}
        <div className="w-full space-y-4">
          {/* 英文释义 */}
          <div 
            className={cn(
              "text-center transition-all duration-300",
              showMeaning ? "opacity-100" : "opacity-0"
            )}
          >
            <p className="text-base text-ink-gray font-sans italic">
              {meaning}
            </p>
          </div>
          
          {/* Mode B: 拼写输入框 */}
          {mode === "B" && (
            <div className="relative">
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                placeholder="输入拼音..."
                className={cn(
                  "w-full px-4 py-3 text-center font-sans text-lg",
                  "bg-transparent border border-border",
                  "placeholder:text-ink-gray/50",
                  "focus:outline-none focus:border-ink-vermilion",
                  "transition-colors duration-200",
                  isCorrect && "border-ink-bamboo text-ink-bamboo"
                )}
              />
            </div>
          )}
        </div>
      </div>
      
      {/* 点击显示释义的隐藏区域 */}
      <button
        type="button"
        onClick={() => setShowMeaning(!showMeaning)}
        className="absolute inset-0 cursor-pointer"
        aria-label={showMeaning ? "隐藏释义" : "显示释义"}
      />
    </div>
  )
}
