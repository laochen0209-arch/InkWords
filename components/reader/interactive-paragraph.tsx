"use client"

/**
 * @file interactive-paragraph.tsx
 * @description 交互式段落组件，支持点击句子播放语音
 * @author InkWords Team
 * @date 2026-02-08
 * @version 2.0.0 - 修复语音播放问题
 */

import { useState, useMemo, useEffect, useCallback, useRef } from "react"
import { Volume2 } from "lucide-react"

interface InteractiveParagraphProps {
  text: string
  lang?: string
  fontSize?: "base" | "lg" | "xl"
  fontFamily?: "serif" | "kaiti"
}

// 【关键修复】全局语音状态，确保只加载一次
let globalVoicesLoaded = false
let globalVoices: SpeechSynthesisVoice[] = []

/**
 * 【关键修复】预加载语音列表
 */
const preloadVoices = () => {
  if (typeof window === 'undefined') return
  
  const loadVoices = () => {
    const voices = window.speechSynthesis.getVoices()
    if (voices.length > 0) {
      globalVoices = voices
      globalVoicesLoaded = true
      console.log('[InteractiveParagraph] 语音列表已加载:', voices.length)
    }
  }
  
  loadVoices()
  
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    const originalHandler = window.speechSynthesis.onvoiceschanged
    window.speechSynthesis.onvoiceschanged = (ev) => {
      loadVoices()
      if (originalHandler) originalHandler.call(window.speechSynthesis, ev)
    }
  }
}

/**
 * 【关键修复】获取最佳语音
 */
const getBestVoice = (lang: string): SpeechSynthesisVoice | null => {
  if (!globalVoicesLoaded || globalVoices.length === 0) {
    // 尝试重新加载
    globalVoices = window.speechSynthesis.getVoices()
  }
  
  if (globalVoices.length === 0) return null
  
  // 优先 Google/Microsoft 语音
  const googleVoice = globalVoices.find(v => 
    v.lang === lang && v.name.toLowerCase().includes("google")
  )
  if (googleVoice) return googleVoice
  
  const microsoftVoice = globalVoices.find(v => 
    v.lang === lang && v.name.toLowerCase().includes("microsoft")
  )
  if (microsoftVoice) return microsoftVoice
  
  // 回退到第一个匹配的语音
  return globalVoices.find(v => v.lang === lang) || null
}

export function InteractiveParagraph({ 
  text, 
  lang = "en-US",
  fontSize = "base",
  fontFamily = "serif"
}: InteractiveParagraphProps) {
  const [playingIndex, setPlayingIndex] = useState<number | null>(null)
  const [voicesReady, setVoicesReady] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  // 【关键修复】组件挂载时预加载语音
  useEffect(() => {
    preloadVoices()
    
    // 延迟检查语音是否加载
    const checkVoices = () => {
      if (globalVoicesLoaded) {
        setVoicesReady(true)
      } else {
        const voices = window.speechSynthesis.getVoices()
        if (voices.length > 0) {
          globalVoices = voices
          globalVoicesLoaded = true
          setVoicesReady(true)
        }
      }
    }
    
    checkVoices()
    const timer = setTimeout(checkVoices, 500)
    
    return () => clearTimeout(timer)
  }, [])

  /**
   * 智能分句逻辑
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
   * 【关键修复】播放逻辑 - 添加错误处理和重试
   */
  const playSentence = useCallback((sentence: string, index: number) => {
    if (!sentence || typeof window === 'undefined') return
    
    // 停止之前的播放
    if (utteranceRef.current) {
      window.speechSynthesis.cancel()
      utteranceRef.current = null
    }
    
    // 【关键修复】Chrome 浏览器需要 resume
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume()
    }
    
    // 【关键修复】确保语音列表已加载
    if (!globalVoicesLoaded) {
      preloadVoices()
      const voices = window.speechSynthesis.getVoices()
      if (voices.length > 0) {
        globalVoices = voices
        globalVoicesLoaded = true
      }
    }
    
    const utterance = new SpeechSynthesisUtterance(sentence)
    utterance.lang = lang
    utterance.rate = 0.9
    utterance.pitch = 1.0
    utterance.volume = 1.0
    
    // 【关键修复】设置最佳语音
    const bestVoice = getBestVoice(lang)
    if (bestVoice) {
      utterance.voice = bestVoice
      console.log('[InteractiveParagraph] 使用语音:', bestVoice.name)
    }
    
    utterance.onstart = () => {
      console.log('[InteractiveParagraph] 开始播放:', sentence.substring(0, 30))
      setPlayingIndex(index)
    }
    
    utterance.onend = () => {
      console.log('[InteractiveParagraph] 播放结束')
      setPlayingIndex(null)
      utteranceRef.current = null
    }
    
    utterance.onerror = (event) => {
      if (event.error === 'interrupted' || event.error === 'canceled') {
        console.log('[InteractiveParagraph] 播放被中断（正常）')
      } else {
        console.error('[InteractiveParagraph] 播放错误:', event.error)
      }
      setPlayingIndex(null)
      utteranceRef.current = null
    }
    
    utteranceRef.current = utterance
    
    // 【关键修复】使用 setTimeout 确保在用户交互上下文中执行
    setTimeout(() => {
      try {
        window.speechSynthesis.speak(utterance)
      } catch (error) {
        console.error('[InteractiveParagraph] 播放失败:', error)
        setPlayingIndex(null)
      }
    }, 10)
  }, [lang])

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
            playSentence(sentence.text, sentence.id)
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
