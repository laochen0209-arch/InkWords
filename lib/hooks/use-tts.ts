/**
 * 智能文本转语音 Hook (Smart Text-to-Speech)
 * 使用 Web Speech API 实现语音播放功能
 * 
 * @file use-tts.ts
 * @description 提供文本转语音功能，支持中英文播放
 * @author InkWords Team
 * @date 2026-02-08
 * @version 2.0.0 - 修复语音加载和播放问题
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
  const [voicesLoaded, setVoicesLoaded] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const pendingTextRef = useRef<string | null>(null)
  
  /**
   * 检查浏览器是否支持语音合成
   */
  const isSupported = typeof window !== "undefined" && "speechSynthesis" in window
  
  /**
   * 【关键修复】预加载语音列表
   * Chrome 浏览器需要等待 voiceschanged 事件
   */
  useEffect(() => {
    if (!isSupported) return

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices()
      if (voices.length > 0) {
        setVoicesLoaded(true)
        console.log('[TTS] 语音列表已加载:', voices.length, '个语音')
        
        // 如果有待播放的文本，立即播放
        if (pendingTextRef.current) {
          const text = pendingTextRef.current
          pendingTextRef.current = null
          setTimeout(() => speak(text), 100)
        }
      }
    }

    // 立即尝试加载
    loadVoices()

    // 监听语音列表变化
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices
    }

    return () => {
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = null
      }
    }
  }, [isSupported])
  
  /**
   * 获取最佳语音
   * 根据学习模式选择最合适的语音
   */
  const getBestVoice = useCallback((lang: string): SpeechSynthesisVoice | null => {
    if (!isSupported) return null
    
    const voices = window.speechSynthesis.getVoices()
    if (voices.length === 0) {
      console.warn('[TTS] 语音列表为空，等待加载...')
      return null
    }
    
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
      console.warn("[TTS] Speech synthesis not supported")
      return
    }
    
    if (!text || text.trim() === "") {
      console.warn("[TTS] Empty text provided")
      return
    }
    
    // 【关键修复】如果语音列表还没加载，先保存文本等待加载完成
    if (!voicesLoaded) {
      console.log('[TTS] 语音列表未加载，等待中...')
      pendingTextRef.current = text
      return
    }
    
    // 【关键修复】停止之前的播放（防重叠）
    window.speechSynthesis.cancel()
    
    // 【关键修复】Chrome 浏览器需要 resume
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume()
    }
    
    // 创建新的语音实例
    const utterance = new SpeechSynthesisUtterance(text)
    const langCode = getLanguageCode(currentLearningMode)
    utterance.lang = langCode
    
    // 设置最佳语音
    const bestVoice = getBestVoice(langCode)
    if (bestVoice) {
      utterance.voice = bestVoice
      console.log('[TTS] 使用语音:', bestVoice.name)
    } else {
      console.warn('[TTS] 未找到合适的语音，使用默认语音')
    }
    
    // 设置语速和音调（优化体验）
    utterance.rate = 0.9  // 稍慢一点，更清晰
    utterance.pitch = 1.0  // 正常音调
    utterance.volume = 1.0  // 最大音量
    
    // 保存引用以便取消
    utteranceRef.current = utterance
    
    // 事件监听
    utterance.onstart = () => {
      console.log('[TTS] 开始播放:', text.substring(0, 30) + '...')
      setIsPlaying(true)
    }
    
    utterance.onend = () => {
      console.log('[TTS] 播放结束')
      setIsPlaying(false)
      utteranceRef.current = null
    }
    
    utterance.onerror = (event) => {
      // 【关键修复】处理 interrupted 错误
      if (event.error === 'interrupted') {
        console.log('[TTS] 播放被中断（正常行为）')
      } else if (event.error === 'canceled') {
        console.log('[TTS] 播放被取消（正常行为）')
      } else {
        console.error("[TTS] Speech synthesis error:", event.error, event)
      }
      setIsPlaying(false)
      utteranceRef.current = null
    }
    
    // 【关键修复】确保在用户交互上下文中执行
    try {
      window.speechSynthesis.speak(utterance)
    } catch (error) {
      console.error('[TTS] 播放失败:', error)
      setIsPlaying(false)
    }
  }, [isSupported, currentLearningMode, getBestVoice, getLanguageCode, voicesLoaded])
  
  /**
   * 停止播放
   */
  const stop = useCallback(() => {
    if (!isSupported) return
    
    window.speechSynthesis.cancel()
    setIsPlaying(false)
    utteranceRef.current = null
    pendingTextRef.current = null
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
