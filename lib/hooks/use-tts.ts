/**
 * 智能文本转语音 Hook (Smart Text-to-Speech)
 * 使用 Web Speech API 实现语音播放功能
 */

import { useState, useEffect, useRef, useCallback } from "react"

export type LearningMode = "LEARN_CHINESE" | "LEARN_ENGLISH"

interface UseTTSOptions {
  text?: string
  learningMode?: LearningMode
  autoPlay?: boolean
}

interface UseTTSReturn {
  isPlaying: boolean
  speak: (text: string) => void
  stop: () => void
  isSupported: boolean
}

/**
 * 智能文本转语音 Hook
 * 
 * @param options - 配置选项
 * @returns TTS 控制对象
 */
export function useTTS(options: UseTTSOptions = {}): UseTTSReturn {
  const { text: initialText, learningMode: initialLearningMode, autoPlay = false } = options
  
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentText, setCurrentText] = useState(initialText || "")
  const [currentLearningMode, setCurrentLearningMode] = useState(initialLearningMode || "LEARN_CHINESE")
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  
  /**
   * 检查浏览器是否支持语音合成
   */
  const isSupported = typeof window !== "undefined" && "speechSynthesis" in window
  
  /**
   * 获取最佳语音
   * 根据学习模式选择最合适的语音
   */
  const getBestVoice = useCallback((lang: string): SpeechSynthesisVoice | null => {
    if (!isSupported) return null
    
    const voices = window.speechSynthesis.getVoices()
    if (voices.length === 0) return null
    
    // 中文：优先 Google 或 Microsoft 的 zh-CN 声音
    if (lang === "zh-CN") {
      const googleVoice = voices.find(v => 
        v.lang === "zh-CN" && v.name.toLowerCase().includes("google")
      )
      if (googleVoice) return googleVoice
      
      const microsoftVoice = voices.find(v => 
        v.lang === "zh-CN" && v.name.toLowerCase().includes("microsoft")
      )
      if (microsoftVoice) return microsoftVoice
      
      // 回退到第一个 zh-CN 语音
      return voices.find(v => v.lang === "zh-CN") || null
    }
    
    // 英文：优先标准美音 en-US
    if (lang === "en-US") {
      const googleVoice = voices.find(v => 
        v.lang === "en-US" && v.name.toLowerCase().includes("google")
      )
      if (googleVoice) return googleVoice
      
      const microsoftVoice = voices.find(v => 
        v.lang === "en-US" && v.name.toLowerCase().includes("microsoft")
      )
      if (microsoftVoice) return microsoftVoice
      
      // 回退到第一个 en-US 语音
      return voices.find(v => v.lang === "en-US") || null
    }
    
    return null
  }, [isSupported])
  
  /**
   * 获取语言代码
   * 根据学习模式返回对应的语言代码
   */
  const getLanguageCode = useCallback((mode: LearningMode): string => {
    return mode === "LEARN_CHINESE" ? "zh-CN" : "en-US"
  }, [])
  
  /**
   * 播放语音
   * @param text - 要朗读的文本
   */
  const speak = useCallback((text: string) => {
    if (!isSupported) {
      console.warn("Speech synthesis not supported")
      return
    }
    
    if (!text || text.trim() === "") {
      console.warn("Empty text provided")
      return
    }
    
    // 停止之前的播放（防重叠）
    window.speechSynthesis.cancel()
    
    // 创建新的语音实例
    const utterance = new SpeechSynthesisUtterance(text)
    const langCode = getLanguageCode(currentLearningMode)
    utterance.lang = langCode
    
    // 设置最佳语音
    const bestVoice = getBestVoice(langCode)
    if (bestVoice) {
      utterance.voice = bestVoice
    }
    
    // 设置语速和音调（优化体验）
    utterance.rate = 0.9  // 稍慢一点，更清晰
    utterance.pitch = 1.0  // 正常音调
    
    // 保存引用以便取消
    utteranceRef.current = utterance
    
    // 事件监听
    utterance.onstart = () => {
      setIsPlaying(true)
    }
    
    utterance.onend = () => {
      setIsPlaying(false)
      utteranceRef.current = null
    }
    
    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event)
      setIsPlaying(false)
      utteranceRef.current = null
    }
    
    // 开始播放
    window.speechSynthesis.speak(utterance)
  }, [isSupported, currentLearningMode, getBestVoice, getLanguageCode])
  
  /**
   * 停止播放
   */
  const stop = useCallback(() => {
    if (!isSupported) return
    
    window.speechSynthesis.cancel()
    setIsPlaying(false)
    utteranceRef.current = null
  }, [isSupported])
  
  /**
   * 当文本或学习模式变化时，自动播放（可选）
   */
  useEffect(() => {
    if (autoPlay && currentText && currentText.trim() !== "") {
      speak(currentText)
    }
  }, [currentText, currentLearningMode, autoPlay, speak])
  
  /**
   * 更新当前文本
   */
  useEffect(() => {
    if (initialText !== undefined) {
      setCurrentText(initialText)
    }
  }, [initialText])
  
  /**
   * 更新当前学习模式
   */
  useEffect(() => {
    if (initialLearningMode !== undefined) {
      setCurrentLearningMode(initialLearningMode)
    }
  }, [initialLearningMode])
  
  return {
    isPlaying,
    speak,
    stop,
    isSupported
  }
}
