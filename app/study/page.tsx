/**
 * @fileoverview 修习页面 - 智能学习系统
 * @description 提供词汇和句子的学习功能，支持下划线填空模式
 * @author InkWords Team
 * @version 5.0.0 - LEARN_CHINESE 拼音输入模式
 */

"use client"

/**
 * @fileoverview 修习页面 - 智能学习系统
 * @description 提供词汇和句子的学习功能，支持下划线填空模式
 * @version 5.1.0 - 添加 URL 状态持久化
 */

import { useState, useEffect, useCallback, useRef, Suspense } from "react"
import { ArrowLeft, Volume2, X, Check, RotateCcw, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useLanguage } from "@/lib/contexts/language-context"
import { TRANSLATIONS } from "@/lib/i18n"
import { BottomNavBar } from "@/components/library/bottom-nav-bar"
import { UpgradeModal } from "@/components/upgrade/upgrade-modal"
import confetti from "canvas-confetti"
import { pinyin } from "pinyin-pro"
import { recordStudy } from "@/lib/user-stats"
import { logger } from "@/lib/logger"

// LocalStorage keys
const STORAGE_KEYS = {
  STUDY_CATEGORY: 'inkwords_study_category',
  STUDY_MODE: 'inkwords_study_mode',
  STUDY_METHOD: 'inkwords_study_method'
}

const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

// 学习内容的类型定义
interface WordItem {
  id: string
  word: string           // 英文单词 (如 "automation")
  meaning: string        // 中文意思 (如 "自动化")
  pronunciation: string  // 英文音标 (如 "/ˌɔːtəˈmeɪʃən/")
  example: string        // 英文例句
  example_sentence: string; // 对应 DB 列名
  exampleZh?: string     // 中文例句翻译
  category: string
}

interface SentenceItem {
  id: string
  zh: string
  en: string
  pinyin: string
  pronunciation: string
}



// 页面内容组件（需要 Suspense 包裹）
function StudyPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { learningMode, targetLang } = useLanguage()
  const t = TRANSLATIONS[learningMode]

  // 从 URL 或 LocalStorage 获取初始状态
  const getInitialState = useCallback(() => {
    // 优先级：URL > LocalStorage > 默认值
    const urlCategory = searchParams.get('category')
    const urlMode = searchParams.get('mode') as "word" | "sentence" | null
    const urlMethod = searchParams.get('method') as "A" | "B" | null

    return {
      category: urlCategory || loadFromStorage(STORAGE_KEYS.STUDY_CATEGORY, 'Lifestyle'),
      mode: urlMode || loadFromStorage(STORAGE_KEYS.STUDY_MODE, 'word'),
      method: urlMethod || loadFromStorage(STORAGE_KEYS.STUDY_METHOD, 'B')
    }
  }, [searchParams])

  const initialState = getInitialState()

  // 状态管理
  const [currentIndex, setCurrentIndex] = useState(0)
  const [mode, setMode] = useState<"A" | "B">(initialState.method)
  const [isPlaying, setIsPlaying] = useState(false)
  const [practiceMode, setPracticeMode] = useState<"word" | "sentence">(initialState.mode)
  const [showHint, setShowHint] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(initialState.category)
  const [wordInputs, setWordInputs] = useState<string[]>([])
  const [sentenceInputs, setSentenceInputs] = useState<string[]>([])
  const [feedbackStatus, setFeedbackStatus] = useState<'idle' | 'correct' | 'wrong'>('idle')
  // 【新增】记录每个输入框的错误状态
  const [inputErrors, setInputErrors] = useState<boolean[]>([])
  // 【新增】抖动动画状态
  const [isShaking, setIsShaking] = useState(false)

  // 拼音相关状态
  const [wordPinyinArray, setWordPinyinArray] = useState<string[]>([])
  const [wordPinyinFull, setWordPinyinFull] = useState<string>('')
  const [sentencePinyinArray, setSentencePinyinArray] = useState<string[]>([])
  const [sentencePinyinFull, setSentencePinyinFull] = useState<string>('')

  // 数据状态
  const [words, setWords] = useState<WordItem[]>([])
  const [sentences, setSentences] = useState<SentenceItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  // 更新 URL 参数（不刷新页面）
  const updateUrlParams = useCallback((updates: { category?: string, mode?: string, method?: string }) => {
    const params = new URLSearchParams(searchParams.toString())
    if (updates.category) params.set('category', updates.category)
    if (updates.mode) params.set('mode', updates.mode)
    if (updates.method) params.set('method', updates.method)
    window.history.replaceState(null, '', `/study?${params.toString()}`)
  }, [searchParams])

  // 保存状态到 LocalStorage
  const saveToStorage = useCallback((key: string, value: any) => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [])
  
  // 输入框引用
  const wordInputRefs = useRef<(HTMLInputElement | null)[]>([])
  const sentenceInputRefs = useRef<(HTMLInputElement | null)[]>([])
  
  // 🔒 防止连跳的锁
  const isNavigating = useRef(false)

  // 判断是否为学中文模式
  const isLearnChinese = learningMode === "LEARN_CHINESE"

  // 分类列表 - 根据学习模式动态显示中英文
  // LEARN_CHINESE 模式显示英文 UI，LEARN_ENGLISH 模式显示中文 UI
  const categories = [
    { id: 'Lifestyle', label: isLearnChinese ? 'Lifestyle' : '生活', icon: '☕' },
    { id: 'Professional', label: isLearnChinese ? 'Professional' : '职场', icon: '💼' }
  ]

  // 获取用户ID
  const getUserId = useCallback(() => {
    if (typeof window !== 'undefined') {
      // 优先从 inkwords_user 对象中获取
      const userStr = localStorage.getItem('inkwords_user')
      if (userStr) {
        try {
          const user = JSON.parse(userStr)
          return user.id || user.userId || null
        } catch (e) {
          logger.error('解析用户数据失败:', e)
        }
      }
      // 兼容旧版本直接存储的 userId
      return localStorage.getItem('userId')
    }
    return null
  }, [])

  // 获取学习数据
  const fetchStudyData = useCallback(async (categoryLabel: string, signal?: AbortSignal) => {
    try {
      setIsLoading(true)
      setError(null)
      
      // 清空旧数据
      setWords([])
      setSentences([])
      setCurrentIndex(0)
      setFeedbackStatus('idle')
      setShowHint(false)
      setWordInputs([])
      setSentenceInputs([])
      setWordPinyinArray([])
      setWordPinyinFull('')
      setSentencePinyinArray([])
      setSentencePinyinFull('')
      
      const userId = getUserId()
      const dbCategory = categoryLabel

      logger.log('获取学习数据:', { category: categoryLabel, dbCategory, userId })
      
      const response = await fetch(`/api/study/data?category=${encodeURIComponent(dbCategory)}`, {
        headers: userId ? { 'x-user-id': userId } : {},
        signal,
      })

      const data = await response.json()
      logger.log('获取数据结果:', {
        status: response.status,
        wordsCount: data.words?.length,
        sentencesCount: data.sentences?.length,
        code: data.code,
        error: data.error,
      })

      // 检查是否达到限额
      if (response.status === 403 && data.code === 'LIMIT_REACHED') {
        setShowUpgradeModal(true)
        setWords([])
        setSentences([])
        return
      }

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`获取数据失败: ${response.status} ${errorText}`)
      }

      setWords(data.words || [])
      setSentences(data.sentences || [])
      
    } catch (err) {
      // 忽略请求取消错误
      if (err instanceof Error && err.name === 'AbortError') {
        logger.log('请求被取消')
        return
      }
      logger.error('获取数据失败:', err)
      setError('获取学习数据失败，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }, [getUserId])

  // 分类变化时重新获取数据
  useEffect(() => {
    const controller = new AbortController()
    fetchStudyData(selectedCategory, controller.signal)
    
    return () => {
      controller.abort()
    }
  }, [selectedCategory, fetchStudyData])

  // 获取当前学习内容
  const currentWord = words[currentIndex]
  const currentSentence = sentences[currentIndex]
  const currentItem = practiceMode === "word" ? currentWord : currentSentence
  
  const totalItems = practiceMode === "word" ? words.length : sentences.length
  const progress = totalItems > 0 ? ((currentIndex + 1) / totalItems) * 100 : 0

  // 当单词变化时，初始化拼音和输入框
  useEffect(() => {
    if (currentWord && isLearnChinese) {
      // 使用 pinyin-pro 将中文转换为拼音
      const chineseText = currentWord.meaning
      
      // 获取拼音数组（无声调）
      const pinyinArray = pinyin(chineseText, { 
        toneType: 'none',
        type: 'array'
      }) as string[]
      
      // 获取带声调的完整拼音
      const pinyinFull = pinyin(chineseText, { 
        toneType: 'symbol'
      })
      
      setWordPinyinArray(pinyinArray)
      setWordPinyinFull(pinyinFull)
      setWordInputs(Array(pinyinArray.length).fill(''))
      wordInputRefs.current = Array(pinyinArray.length).fill(null)
      
      logger.log('拼音转换:', { chinese: chineseText, pinyinArray, pinyinFull })
      
      // ✅ 修复：使用 Ref 聚焦第一个输入框 (兼容中英文模式)
      const timer = setTimeout(() => {
        if (wordInputRefs.current[0]) {
          wordInputRefs.current[0].focus()
        }
      }, 50) // 缩短延迟，提升响应感
      return () => clearTimeout(timer)
    } else if (currentWord && !isLearnChinese) {
      // ✅ 英文模式：初始化为单个空字符串，代表一个大输入框
      setWordInputs([''])
      wordInputRefs.current = [null]
      setWordPinyinArray([])
      setWordPinyinFull('')
      
      // ✅ 修复：使用 Ref 聚焦第一个输入框 (兼容中英文模式)
      const timer = setTimeout(() => {
        if (wordInputRefs.current[0]) {
          wordInputRefs.current[0].focus()
        }
      }, 50) // 缩短延迟，提升响应感
      return () => clearTimeout(timer)
    }
  }, [currentWord, isLearnChinese])

  // 当句子变化时，初始化拼音和输入框
  useEffect(() => {
    if (currentSentence && isLearnChinese) {
      // 使用 pinyin-pro 将中文句子转换为拼音
      const chineseText = currentSentence.zh
      
      // 获取拼音数组（无声调）
      const pinyinArray = pinyin(chineseText, { 
        toneType: 'none',
        type: 'array'
      }) as string[]
      
      // 获取带声调的完整拼音
      const pinyinFull = pinyin(chineseText, { 
        toneType: 'symbol'
      })
      
      setSentencePinyinArray(pinyinArray)
      setSentencePinyinFull(pinyinFull)
      setSentenceInputs(Array(pinyinArray.length).fill(''))
      sentenceInputRefs.current = Array(pinyinArray.length).fill(null)
      
      logger.log('句子拼音转换:', { chinese: chineseText, pinyinArray, pinyinFull })
      
      // ✅ 修复：使用 Ref 聚焦句子模式的第一个框
      const timer = setTimeout(() => {
        if (sentenceInputRefs.current[0]) {
          sentenceInputRefs.current[0].focus()
        }
      }, 50)
      return () => clearTimeout(timer)
    } else if (currentSentence && !isLearnChinese) {
      // 学英文模式：按单词分割
      const tokens = currentSentence.en?.split(/\s+/).filter(Boolean) || []
      if (tokens.length > 0) {
        setSentenceInputs(Array(tokens.length).fill(''))
        setInputErrors(Array(tokens.length).fill(false)) // 【新增】重置错误状态
        sentenceInputRefs.current = Array(tokens.length).fill(null)
        setSentencePinyinArray([])
        setSentencePinyinFull('')
        
        // ✅ 修复：使用 Ref 聚焦句子模式的第一个框
        const timer = setTimeout(() => {
          if (sentenceInputRefs.current[0]) {
            sentenceInputRefs.current[0].focus()
          }
        }, 50)
        return () => clearTimeout(timer)
      }
    }
  }, [currentSentence, isLearnChinese])

  // 处理单词输入
  const handleWordInputChange = (index: number, value: string) => {
    const newInputs = [...wordInputs]
    newInputs[index] = value
    setWordInputs(newInputs)
  }

  // 【优化】处理句子输入 - 添加实时错误检测
  const handleSentenceInputChange = (index: number, value: string) => {
    const newInputs = [...sentenceInputs]
    newInputs[index] = value
    setSentenceInputs(newInputs)
    
    // 【新增】实时错误检测
    if (!isLearnChinese && practiceMode === 'sentence') {
      const sentence = currentItem as SentenceItem
      const tokens = sentence?.en?.split(/\s+/).filter(Boolean) || []
      const correctWord = tokens[index]?.toLowerCase() || ''
      const userWord = value.toLowerCase().trim()
      
      // 只有当用户输入完成一个单词时才检测（输入长度 >= 正确答案长度）
      if (userWord.length >= correctWord.length && correctWord.length > 0) {
        const newErrors = [...inputErrors]
        newErrors[index] = userWord !== correctWord
        setInputErrors(newErrors)
      } else if (userWord.length === 0) {
        // 清空输入时重置错误状态
        const newErrors = [...inputErrors]
        newErrors[index] = false
        setInputErrors(newErrors)
      }
    }
  }

  // 处理下一个
  const handleNext = useCallback(async () => {
    // 🔒 如果正在跳转中，直接无视后续请求
    if (isNavigating.current) return

    // 记录学习活动（只有在回答正确后才记录）
    if (feedbackStatus === 'correct') {
      try {
        // 【修复】传递 userId 给 recordStudy
        const userId = getUserId()
        if (userId) {
          await recordStudy(1, userId)
          logger.log('学习记录已更新')
        } else {
          logger.warn('用户未登录，跳过学习记录更新')
        }
      } catch (error) {
        logger.error('更新学习记录失败:', error)
      }
    }

    if (currentIndex < totalItems - 1) {
      isNavigating.current = true // 🔒 上锁
      setCurrentIndex(prev => prev + 1)
      setFeedbackStatus('idle')
      setShowHint(false)

      // 🔓 500ms 后解锁
      setTimeout(() => {
        isNavigating.current = false
      }, 500)
    }
  }, [currentIndex, totalItems, feedbackStatus, getUserId])

  // 检查答案
  const handleCheck = useCallback(() => {
    if (!currentItem) return

    // 🛠️ 辅助函数：归一化文本（标点宽容处理）
    const normalizeText = (text: string) => {
      return text
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '') // 去除空格
        .replace(/，/g, ',') // 中文逗号 -> 英文
        .replace(/。/g, '.') // 中文句号 -> 英文
        .replace(/！/g, '!') // 中文感叹号 -> 英文
        .replace(/？/g, '?') // 中文问号 -> 英文
        .replace(/“|”|‘|’/g, "'") // 中文引号 -> 英文
        .replace(/（/g, '(') // 中文左括号 -> 英文
        .replace(/）/g, ')') // 中文右括号 -> 英文
        .replace(/：/g, ':') // 中文冒号 -> 英文
        .replace(/；/g, ';') // 中文分号 -> 英文
    }

    let correctAnswer: string
    let userAnswer: string
    
    if (practiceMode === "word") {
      const word = currentItem as WordItem
      if (isLearnChinese) {
        // 学中文模式：用户输入拼音，正确答案也是拼音
        correctAnswer = wordPinyinArray.join('')
        userAnswer = wordInputs.join('').toLowerCase()
      } else {
        // 学英文模式：用户输入英文单词
        correctAnswer = word.word.toLowerCase()
        userAnswer = wordInputs.join('').toLowerCase()
      }
    } else {
      const sentence = currentItem as SentenceItem
      if (isLearnChinese) {
        // 学中文模式：用户输入拼音，正确答案也是拼音
        correctAnswer = sentencePinyinArray.join('')
        userAnswer = sentenceInputs.join('').toLowerCase()
      } else {
        // 学英文模式：用户输入英文句子
        correctAnswer = sentence.en.toLowerCase()
        userAnswer = sentenceInputs.join(' ').toLowerCase()
      }
    }

    // ✅ 新逻辑：使用归一化函数处理标点
    const normalizedUser = normalizeText(userAnswer)
    const normalizedCorrect = normalizeText(correctAnswer)

    if (normalizedUser === normalizedCorrect) {
        setFeedbackStatus('correct')
        setIsShaking(false)
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
        
        // 不再自动跳转，等待用户按回车或空格键
        // 用户可以在查看正确答案后，按回车或空格键继续
      } else {
        setFeedbackStatus('wrong')
        
        // 【新增】触发抖动动画
        setIsShaking(true)
        setTimeout(() => setIsShaking(false), 500)
        
        // 【新增】更新每个单词的错误状态（仅学英文模式）
        if (!isLearnChinese && practiceMode === 'sentence') {
          const sentence = currentItem as SentenceItem
          const tokens = sentence?.en?.split(/\s+/).filter(Boolean) || []
          const newErrors = tokens.map((token, idx) => {
            const userWord = sentenceInputs[idx]?.toLowerCase().trim() || ''
            return userWord !== token.toLowerCase()
          })
          setInputErrors(newErrors)
        }
      }
  }, [currentItem, practiceMode, isLearnChinese, wordPinyinArray, wordInputs, sentencePinyinArray, sentenceInputs, handleNext])

  // 处理上一个
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
      setFeedbackStatus('idle')
      setShowHint(false)
    }
  }

  // 切换分类（带状态持久化）
  const handleCategoryChange = useCallback((categoryLabel: string) => {
    logger.log('切换分类:', categoryLabel)
    setSelectedCategory(categoryLabel)
    // 保存到 LocalStorage
    saveToStorage(STORAGE_KEYS.STUDY_CATEGORY, categoryLabel)
    // 更新 URL
    updateUrlParams({ category: categoryLabel })
  }, [saveToStorage, updateUrlParams])

  // 切换练习模式（带状态持久化）
  const handlePracticeModeChange = useCallback((newMode: "word" | "sentence") => {
    setPracticeMode(newMode)
    setCurrentIndex(0)
    setFeedbackStatus('idle')
    setShowHint(false)
    // 保存到 LocalStorage
    saveToStorage(STORAGE_KEYS.STUDY_MODE, newMode)
    // 更新 URL
    updateUrlParams({ mode: newMode })
  }, [saveToStorage, updateUrlParams])

  // 切换学习模式（带状态持久化）
  const handleModeChange = useCallback((newMode: "A" | "B") => {
    setMode(newMode)
    setFeedbackStatus('idle')
    setShowHint(false)
    // 保存到 LocalStorage
    saveToStorage(STORAGE_KEYS.STUDY_METHOD, newMode)
    // 更新 URL
    updateUrlParams({ method: newMode })
  }, [saveToStorage, updateUrlParams])

  // 全局键盘监听 - Enter/空格键控制检查/下一题
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // 支持 Enter 键和空格键
      if ((e.key === 'Enter' || e.key === ' ') && mode === 'B' && currentItem) {
        // 防止空格键滚动页面
        if (e.key === ' ') {
          e.preventDefault()
        }
        
        if (feedbackStatus === 'correct') {
          // 如果已经正确，Enter/空格键进入下一题
          handleNext()
        } else if (feedbackStatus === 'idle' || feedbackStatus === 'wrong') {
          // 如果未检查或错误，Enter/空格键执行检查
          handleCheck()
        }
      }
    }

    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [mode, currentItem, feedbackStatus, handleNext, handleCheck])

  // 【关键修复】播放语音 - 添加预加载和错误处理
  // 【修复】音频播放相关状态
  const [voicesLoaded, setVoicesLoaded] = useState(false)
  
  // 【修复】预加载语音列表
  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      logger.warn('浏览器不支持语音合成')
      return
    }
    
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices()
      if (voices.length > 0) {
        setVoicesLoaded(true)
        logger.log('语音列表已加载:', voices.length)
      }
    }
    
    // 立即尝试加载
    loadVoices()
    
    // 监听语音列表变化事件（Chrome 需要）
    window.speechSynthesis.onvoiceschanged = loadVoices
    
    return () => {
      window.speechSynthesis.onvoiceschanged = null
    }
  }, [])

  const handlePlay = () => {
    if (!currentItem) return
    
    if (!('speechSynthesis' in window)) {
      logger.warn('浏览器不支持语音合成')
      return
    }
    
    let text: string
    
    if (practiceMode === "word") {
      const word = currentItem as WordItem
      text = isLearnChinese ? word.meaning : word.word
    } else {
      const sentence = currentItem as SentenceItem
      text = isLearnChinese ? sentence.zh : sentence.en
    }
    
    if (!text || text.trim() === '') {
      logger.warn('空文本，跳过播放')
      return
    }
    
    try {
      // 【修复】强制恢复音频上下文（解决浏览器自动播放策略）
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume()
      }
      
      // 【修复】取消之前的播放
      window.speechSynthesis.cancel()
      
      const utterance = new SpeechSynthesisUtterance(text)
      const langCode = isLearnChinese ? 'zh-CN' : 'en-US'
      utterance.lang = langCode
      
      // 【修复】获取最佳语音 - 等待语音列表加载
      const voices = window.speechSynthesis.getVoices()
      const bestVoice = voices.find(v => v.lang === langCode) || 
                        voices.find(v => v.lang.startsWith(isLearnChinese ? 'zh' : 'en'))
      if (bestVoice) {
        utterance.voice = bestVoice
        logger.log('使用语音:', bestVoice.name)
      } else {
        logger.warn('未找到合适的语音，使用默认语音')
      }
      
      utterance.rate = 0.9
      utterance.pitch = 1.0
      utterance.volume = 1.0
      
      // 事件监听
      utterance.onstart = () => {
        logger.log('开始播放:', text.substring(0, 30))
        setIsPlaying(true)
      }
      
      utterance.onend = () => {
        logger.log('播放结束')
        setIsPlaying(false)
      }
      
      utterance.onerror = (event) => {
        // 处理 interrupted 错误
        if (event.error === 'interrupted' || event.error === 'canceled') {
          logger.log('播放被中断（正常行为）')
        } else {
          logger.error('播放错误:', event.error)
        }
        setIsPlaying(false)
      }
      
      // 【修复】直接播放，不使用 setTimeout
      window.speechSynthesis.speak(utterance)
    } catch (error) {
      logger.error('播放失败:', error)
      setIsPlaying(false)
    }
  }

  // 加载状态 - 优化版本，显示 AI 生成提示和骨架屏
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-0 bg-ink-paper ink-landscape-bg">
        {/* 背景装饰 */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-32 h-32 bg-[#C23E32]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-40 right-10 w-40 h-40 bg-[#C23E32]/10 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
          {/* AI 生成提示 */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm mb-6">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C23E32] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#C23E32]"></span>
              </span>
              <span className="text-sm font-medium text-[#C23E32]">
                {isLearnChinese ? "⚡️ AI is generating your practice..." : "⚡️ AI 正在生成专属练习..."}
              </span>
            </div>
          </div>

          {/* 骨架屏卡片 */}
          <div className="w-full max-w-2xl mx-auto">
            {/* 分类选择器骨架 */}
            <div className="flex justify-center gap-3 mb-6">
              <div className="w-24 h-10 bg-white/60 rounded-full animate-pulse" />
              <div className="w-24 h-10 bg-white/60 rounded-full animate-pulse" />
            </div>

            {/* 进度条骨架 */}
            <div className="w-full h-2 bg-white/40 rounded-full mb-8 overflow-hidden">
              <div className="h-full bg-[#C23E32]/30 rounded-full animate-pulse w-1/3" />
            </div>

            {/* 主要内容卡片骨架 */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/50">
              {/* 模式切换骨架 */}
              <div className="flex justify-center gap-2 mb-8">
                <div className="w-20 h-8 bg-gray-100 rounded-lg animate-pulse" />
                <div className="w-20 h-8 bg-gray-100 rounded-lg animate-pulse" />
              </div>

              {/* 题目内容骨架 */}
              <div className="space-y-6">
                {/* 提示文字骨架 */}
                <div className="text-center space-y-2">
                  <div className="w-48 h-4 bg-gray-100 rounded mx-auto animate-pulse" />
                  <div className="w-32 h-3 bg-gray-100 rounded mx-auto animate-pulse" />
                </div>

                {/* 主要内容骨架 */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 min-h-[200px] flex items-center justify-center">
                  <div className="space-y-4 w-full max-w-md">
                    <div className="w-full h-12 bg-white rounded-xl animate-pulse" />
                    <div className="flex gap-2 justify-center">
                      <div className="w-12 h-12 bg-white rounded-lg animate-pulse" />
                      <div className="w-12 h-12 bg-white rounded-lg animate-pulse" />
                      <div className="w-12 h-12 bg-white rounded-lg animate-pulse" />
                      <div className="w-12 h-12 bg-white rounded-lg animate-pulse" />
                    </div>
                  </div>
                </div>

                {/* 按钮骨架 */}
                <div className="flex justify-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full animate-pulse" />
                  <div className="w-32 h-12 bg-[#C23E32]/20 rounded-full animate-pulse" />
                  <div className="w-12 h-12 bg-gray-100 rounded-full animate-pulse" />
                </div>
              </div>
            </div>

            {/* 底部提示 */}
            <p className="text-center text-sm text-ink-gray/60 mt-6">
              {isLearnChinese 
                ? "Preparing personalized content for you..." 
                : "正在为您准备个性化学习内容..."}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // 错误状态
  if (error) {
    return (
      <div className="fixed inset-0 z-0 bg-ink-paper ink-landscape-bg flex items-center justify-center">
        <div className="text-center bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl max-w-md mx-4">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <p className="text-ink-black font-serif text-lg mb-4">{error}</p>
          <button
            onClick={() => fetchStudyData(selectedCategory)}
            className="px-6 py-3 bg-[#C23E32] text-white rounded-full font-serif hover:bg-[#A93226] transition-colors"
          >
            {isLearnChinese ? "Retry" : "重试"}
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="fixed inset-0 z-0 bg-ink-paper ink-landscape-bg" />
      
      <div className="relative z-10 min-h-screen overflow-y-auto pb-20">
        {/* 返回按钮 */}
        <Link 
          href="/library"
          className="absolute top-4 left-4 z-50 w-10 h-10 flex items-center justify-center text-ink-black hover:text-ink-vermilion transition-colors bg-white/80 backdrop-blur-sm rounded-full shadow-md"
        >
          <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
        </Link>

        <div className="w-full px-4 py-6">
          <div className="max-w-4xl mx-auto">
            {/* 标题 */}
            <h1 className="text-2xl font-serif font-bold text-ink-black text-center mb-6">
              {t.practice.title}
            </h1>

            {/* 分类选择 */}
            <div className="flex items-center justify-center gap-3 mb-8 overflow-x-auto pb-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`
                    flex items-center gap-2 px-6 py-3 rounded-full
                    font-serif text-base transition-all duration-200 whitespace-nowrap
                    ${selectedCategory === category.id
                      ? "bg-[#C23E32] text-white font-medium shadow-lg"
                      : "bg-white text-ink-black/70 hover:bg-stone-100/50 border-2 border-stone-300"
                    }
                  `}
                >
                  <span className="text-xl">{category.icon}</span>
                  <span className="font-medium">{category.label}</span>
                </button>
              ))}
            </div>

            {/* 主内容区 */}
            <div className="bg-white/80 backdrop-blur-sm border border-stone-200 shadow-xl rounded-2xl p-8">
              {/* 模式切换 */}
              <div className="flex items-center justify-center gap-4 mb-8">
                <button
                  onClick={() => handlePracticeModeChange("word")}
                  className={`px-8 py-3 rounded-full font-serif text-base transition-all duration-200
                    ${practiceMode === "word"
                      ? "bg-[#C23E32] text-white font-medium shadow-md"
                      : "bg-white text-ink-black/70 hover:bg-stone-50 border-2 border-stone-300"
                    }`}
                >
                  {t.practice.tabs.word}
                </button>
                <button
                  onClick={() => handlePracticeModeChange("sentence")}
                  className={`px-8 py-3 rounded-full font-serif text-base transition-all duration-200
                    ${practiceMode === "sentence"
                      ? "bg-[#C23E32] text-white font-medium shadow-md"
                      : "bg-white text-ink-black/70 hover:bg-stone-50 border-2 border-stone-300"
                    }`}
                >
                  {t.practice.tabs.sentence}
                </button>
              </div>

              {/* 学习模式切换 */}
              <div className="flex items-center justify-center gap-4 mb-8">
                <button
                  onClick={() => handleModeChange("A")}
                  className={`px-8 py-3 rounded-full font-serif text-base transition-all duration-200
                    ${mode === "A"
                      ? "bg-[#C23E32] text-white font-medium shadow-md"
                      : "bg-white text-ink-black/70 hover:bg-stone-50 border-2 border-stone-300"
                    }`}
                >
                  {isLearnChinese ? "拼写 (Spelling)" : "拼写"}
                </button>
                <button
                  onClick={() => handleModeChange("B")}
                  className={`px-8 py-3 rounded-full font-serif text-base transition-all duration-200
                    ${mode === "B"
                      ? "bg-[#C23E32] text-white font-medium shadow-md"
                      : "bg-white text-ink-black/70 hover:bg-stone-50 border-2 border-stone-300"
                    }`}
                >
                  {isLearnChinese ? "默写 (Dictation)" : "默写"}
                </button>
              </div>

              {/* 学习内容卡片 */}
              <div className="bg-white rounded-3xl shadow-lg p-10 mb-8">
                {currentItem ? (
                  practiceMode === "word" ? (
                    // 单词练习
                    <div className="space-y-8">
                      {/* 主展示区 - 目标文字 */}
                      <div className="text-center space-y-3">
                        {/* 根据学习模式显示不同的标题 */}
                        {isLearnChinese ? (
                          // 学中文模式
                          <>
                            {/* 题目：英文意思 - 永远显示 */}
                            <h2 className="text-5xl font-serif font-bold text-ink-black tracking-wide">
                              {(currentItem as WordItem)?.word || ''}
                            </h2>
                            {/* 答案：中文字符 - 模式A或开提示或正确时才显示 */}
                            {(mode === "A" || showHint || feedbackStatus === 'correct') && (
                              <h3 className="text-xl font-serif text-ink-gray/70">
                                {(currentItem as WordItem)?.meaning || ''}
                              </h3>
                            )}
                          </>
                        ) : (
                          // 学英文模式
                          <>
                            {/* 题目：中文意思 - 永远显示 */}
                            <h2 className="text-5xl font-serif font-bold text-ink-black tracking-wide">
                              {(currentItem as WordItem)?.meaning || ''}
                            </h2>
                            {/* 答案：英文单词 - 模式A或开提示或正确时才显示 */}
                            {(mode === "A" || showHint || feedbackStatus === 'correct') && (
                              <h3 className="text-xl font-serif text-ink-gray/70">
                                {(currentItem as WordItem)?.word || ''}
                              </h3>
                            )}
                          </>
                        )}
                        {/* 音标 - 模式A或开提示或正确时才显示 */}
                        {(mode === "A" || showHint || feedbackStatus === 'correct') && (
                          <p className="text-base font-serif text-stone-400">
                            {(currentItem as WordItem)?.pronunciation || ''}
                          </p>
                        )}
                      </div>

                      {/* 输入框 - 拼写和默写模式都显示 */}
                      {(mode === "A" || mode === "B") && isLearnChinese && currentWord && wordInputs.length > 0 && (
                        <div className="mt-8">
                          <div className="flex items-center justify-center gap-6 mb-6">
                            {/* 拼音输入框 */}
                            <div className="flex items-center gap-3">
                              {wordInputs.map((value, index) => {
                                // 【修复】输入框始终显示用户输入的值，不显示提示答案
                                // 提示答案现在只在下方的 Word Details 区域显示
                                const inputDisplayValue = value || ''

                                return (
                                  <input
                                    key={index}
                                    id={`pinyin-input-${index}`}
                                    ref={el => { wordInputRefs.current[index] = el }}
                                    type="text"
                                    value={inputDisplayValue}
                                    onChange={(e) => handleWordInputChange(index, e.target.value)}
                                    onKeyDown={(e) => {
                                      // ✅ 核心修复：阻止冒泡，防止全局监听器再次触发
                                      if (e.key === 'Enter') {
                                        e.stopPropagation() // 🛑 关键！阻止事件传给 Window
                                        e.preventDefault()  // 🛑 阻止默认行为

                                        if (feedbackStatus === 'correct') {
                                          handleNext()
                                        } else {
                                          handleCheck()
                                        }
                                        return // 结束执行
                                      }

                                      // 原有的空格键跳转逻辑保持不变
                                      if (e.key === ' ' && index < wordInputs.length - 1) {
                                        e.preventDefault()
                                        const nextInput = document.getElementById(`pinyin-input-${index + 1}`)
                                        if (nextInput) nextInput.focus()
                                      }

                                      // 原有的 Backspace 逻辑保持不变
                                      if (e.key === 'Backspace' && !value && index > 0) {
                                        const prevInput = document.getElementById(`pinyin-input-${index - 1}`)
                                        if (prevInput) prevInput.focus()
                                      }
                                    }}
                                    readOnly={feedbackStatus === 'correct'}
                                    className={`
                                      w-20 h-14 text-xl font-serif
                                      border-0 border-b-2 rounded-none bg-transparent
                                      text-center focus:outline-none
                                      ${feedbackStatus === 'correct'
                                        ? "border-green-500 text-green-600"
                                        : feedbackStatus === 'wrong'
                                        ? "border-red-500 text-red-600"
                                        : "border-red-500 text-red-500 focus:border-red-600"
                                      }
                                    `}
                                    placeholder="_"
                                  />
                                )
                              })}
                            </div>
                            
                            {/* 提示按钮 */}
                            <button
                              onClick={() => setShowHint(!showHint)}
                              className="w-12 h-12 rounded-full flex items-center justify-center
                                bg-white border-2 border-stone-300 text-ink-black/60
                                hover:bg-stone-100 transition-colors"
                            >
                              {showHint ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                          
                          {/* 反馈信息 */}
                          {feedbackStatus === 'correct' && (
                            <div className="mt-3 text-center">
                              <div className="text-green-600 font-serif text-lg">
                                ✅ Correct! Great job!
                              </div>
                              <div className="text-sm text-stone-400 mt-1">
                                Press Enter or Space to continue
                              </div>
                            </div>
                          )}
                          {feedbackStatus === 'wrong' && (
                            <div className="mt-3 text-center">
                              <div className="text-red-600 font-serif text-lg mb-1">
                                Incorrect. Please try again.
                              </div>
                            </div>
                          )}
                          
                          {/* Word Details - 只在回答正确或点击提示时显示 */}
                          {(feedbackStatus === 'correct' || showHint) && (
                            <div className="mt-8 p-6 bg-stone-50 rounded-xl border border-stone-200">
                              <h4 className="text-sm font-bold text-stone-500 uppercase tracking-wide mb-4">
                                Word Details
                              </h4>
                              <div className="space-y-3">
                                {/* Chinese Meaning */}
                                <div>
                                  <p className="text-sm text-stone-500 mb-1">Chinese Meaning:</p>
                                  <p className="text-ink-black font-serif text-lg">
                                    {(currentItem as WordItem).meaning}
                                  </p>
                                </div>
                                {/* Pinyin */}
                                <div>
                                  <p className="text-sm text-stone-500 mb-1">Pinyin:</p>
                                  <p className="text-ink-gray font-serif">{wordPinyinFull}</p>
                                </div>
                                {/* Pronunciation */}
                                <div>
                                  <p className="text-sm text-stone-500 mb-1">Pronunciation:</p>
                                  <p className="text-ink-gray font-serif">
                                    {(currentItem as WordItem).pronunciation}
                                  </p>
                                </div>
                                {/* English */}
                                <div>
                                  <p className="text-sm text-stone-500 mb-1">English:</p>
                                  <p className="text-ink-gray font-serif">
                                    {(currentItem as WordItem).word}
                                  </p>
                                </div>
                                {/* Example */}
                                {(currentItem as WordItem).example && (
                                  <div className="pt-2 border-t border-stone-200">
                                    <p className="text-sm text-stone-500 mb-1">Example:</p>
                                    <p className="text-ink-black font-serif mb-1">
                                      {(currentItem as WordItem).example}
                                    </p>
                                    <p className="text-ink-gray font-serif text-sm">
                                      {(currentItem as WordItem).exampleZh || 'Translation pending...'}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* 学英文模式的输入框 - 拼写和默写模式都显示 */}
                      {(mode === "A" || mode === "B") && !isLearnChinese && currentWord && wordInputs.length > 0 && (
                        <div className="mt-8">
                          <div className="flex items-center justify-center gap-6 mb-6 flex-wrap">
                            {/* ✅ 英文模式：单个长输入框 */}
                            <input
                              ref={el => { wordInputRefs.current[0] = el }}
                              type="text"
                              value={wordInputs[0] || ''}
                              onChange={(e) => handleWordInputChange(0, e.target.value)}
                              onKeyDown={(e) => {
                                // ✅ 核心修复：阻止冒泡，防止全局监听器再次触发
                                if (e.key === 'Enter') {
                                  e.stopPropagation() // 🛑 关键！阻止事件传给 Window
                                  e.preventDefault()  // 🛑 阻止默认行为

                                  if (feedbackStatus === 'correct') {
                                    handleNext()
                                  } else {
                                    handleCheck()
                                  }
                                  return // 结束执行
                                }
                              }}
                              readOnly={feedbackStatus === 'correct'}
                              className={`
                                w-full max-w-md h-16 text-2xl font-serif tracking-wide
                                border-0 border-b-2 rounded-none bg-transparent
                                text-center focus:outline-none transition-colors
                                ${feedbackStatus === 'correct'
                                  ? "border-green-500 text-green-600"
                                  : feedbackStatus === 'wrong'
                                  ? "border-red-500 text-red-600"
                                  : "border-stone-400 text-ink-black focus:border-[#C23E32]"
                                }
                              `}
                              placeholder="Type the word..."
                            />
                            
                            <button
                              onClick={() => setShowHint(!showHint)}
                              className="w-12 h-12 rounded-full flex items-center justify-center
                                bg-white border-2 border-stone-300 text-ink-black/60
                                hover:bg-stone-100 transition-colors"
                            >
                              {showHint ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                          
                          {feedbackStatus === 'correct' && (
                            <div className="mt-3 text-center">
                              <div className="text-green-600 font-serif text-lg">
                                ✅ Correct! Great job!
                              </div>
                              <div className="text-sm text-stone-400 mt-1">
                                Press Enter or Space to continue
                              </div>
                            </div>
                          )}
                          {feedbackStatus === 'wrong' && (
                            <div className="mt-3 text-center">
                              <div className="text-red-600 font-serif text-lg mb-1">
                                Incorrect. Please try again.
                              </div>
                              <div className="text-stone-600 font-serif text-base">
                                Correct answer: {(currentItem as WordItem).word}
                              </div>
                            </div>
                          )}
                          
                          {/* Word Details - 只在回答正确或点击提示时显示 */}
                          {(feedbackStatus === 'correct' || showHint) && (
                            <div className="mt-8 p-6 bg-stone-50 rounded-xl border border-stone-200">
                              <h4 className="text-sm font-bold text-stone-500 uppercase tracking-wide mb-4">
                                {isLearnChinese ? "Word Details" : "单词详情"}
                              </h4>
                              <div className="space-y-3">
                                {/* Example - 英文造句 */}
                                <div>
                                  <p className="text-sm text-stone-500 mb-1">{isLearnChinese ? "Example:" : "英文造句:"}</p>
                                  <p className="text-ink-black font-serif text-lg">
                                    {(currentItem as WordItem).example_sentence || (currentItem as WordItem).example || "No example available."}
                                  </p>
                                </div>
                                {/* Example Translation - 中文意思 */}
                                <div>
                                  <p className="text-sm text-stone-500 mb-1">{isLearnChinese ? "Translation:" : "中文意思:"}</p>
                                  <p className="text-ink-gray font-serif">
                                    {(currentItem as WordItem).exampleZh || (currentItem as WordItem).meaning}
                                  </p>
                                </div>
                                {/* Pronunciation */}
                                <div>
                                  <p className="text-sm text-stone-500 mb-1">{isLearnChinese ? "Pronunciation:" : "发音:"}</p>
                                  <p className="text-ink-gray font-serif">
                                    {(currentItem as WordItem).pronunciation}
                                  </p>
                                </div>
                                {/* Word */}
                                <div>
                                  <p className="text-sm text-stone-500 mb-1">{isLearnChinese ? "Word:" : "单词:"}</p>
                                  <p className="text-ink-gray font-serif">
                                    {(currentItem as WordItem).word}
                                  </p>
                                </div>
                                {/* Meaning */}
                                <div>
                                  <p className="text-sm text-stone-500 mb-1">{isLearnChinese ? "Meaning:" : "释义:"}</p>
                                  <p className="text-ink-gray font-serif">
                                    {(currentItem as WordItem).meaning}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    // 句子练习
                    <div className="space-y-8">
                      {/* 主展示区 - 目标句子 */}
                      <div className="text-center space-y-3">
                        {/* 根据学习模式显示不同的标题 */}
                        {isLearnChinese ? (
                          // 学中文模式
                          <>
                            {/* 题目：英文翻译 - 永远显示 */}
                            <h2 className="text-3xl font-serif font-bold text-ink-black tracking-wide">
                              {(currentItem as SentenceItem)?.en || ''}
                            </h2>
                            {/* 答案：中文句子 - 模式A或开提示或正确时才显示 */}
                            {(mode === "A" || showHint || feedbackStatus === 'correct') && (
                              <h3 className="text-lg font-serif text-ink-gray/70">
                                {(currentItem as SentenceItem)?.zh || ''}
                              </h3>
                            )}
                          </>
                        ) : (
                          // 学英文模式
                          <>
                            {/* 题目：中文翻译 - 永远显示 */}
                            <h2 className="text-3xl font-serif font-bold text-ink-black tracking-wide">
                              {(currentItem as SentenceItem)?.zh || ''}
                            </h2>
                            {/* 答案：英文句子 - 模式A或开提示或正确时才显示 */}
                            {(mode === "A" || showHint || feedbackStatus === 'correct') && (
                              <h3 className="text-lg font-serif text-ink-gray/70">
                                {(currentItem as SentenceItem)?.en || ''}
                              </h3>
                            )}
                          </>
                        )}
                      </div>

                      {/* 输入框 - 拼写和默写模式都显示 */}
                      {(mode === "A" || mode === "B") && isLearnChinese && currentSentence && sentenceInputs.length > 0 && (
                        <div className="mt-8">
                          <div className="flex items-center justify-center gap-6 mb-6 flex-wrap">
                            {/* 拼音输入框 */}
                            {sentenceInputs.map((value, index) => {
                              // 【修复】输入框始终显示用户输入的值，不显示提示答案
                              const inputDisplayValue = value || ''

                              return (
                                <input
                                  key={index}
                                  id={`sentence-pinyin-input-${index}`}
                                  ref={el => { sentenceInputRefs.current[index] = el }}
                                  type="text"
                                  value={inputDisplayValue}
                                  onChange={(e) => handleSentenceInputChange(index, e.target.value)}
                                  onKeyDown={(e) => {
                                    // ✅ 核心修复：阻止冒泡，防止全局监听器再次触发
                                    if (e.key === 'Enter') {
                                      e.stopPropagation() // 🛑 关键！阻止事件传给 Window
                                      e.preventDefault()  // 🛑 阻止默认行为

                                      if (feedbackStatus === 'correct') {
                                        handleNext()
                                      } else {
                                        handleCheck()
                                      }
                                      return // 结束执行
                                    }

                                    // 原有的空格键跳转逻辑保持不变
                                    if (e.key === ' ' && index < sentenceInputs.length - 1) {
                                      e.preventDefault()
                                      const nextInput = document.getElementById(`sentence-pinyin-input-${index + 1}`)
                                      if (nextInput) nextInput.focus()
                                    }

                                    // 原有的 Backspace 逻辑保持不变
                                    if (e.key === 'Backspace' && !value && index > 0) {
                                      const prevInput = document.getElementById(`sentence-pinyin-input-${index - 1}`)
                                      if (prevInput) prevInput.focus()
                                    }
                                  }}
                                  readOnly={feedbackStatus === 'correct'}
                                  className={`
                                    w-20 h-14 text-xl font-serif
                                    border-0 border-b-2 rounded-none bg-transparent
                                    text-center focus:outline-none
                                    ${feedbackStatus === 'correct'
                                      ? "border-green-500 text-green-600"
                                      : feedbackStatus === 'wrong'
                                      ? "border-red-500 text-red-600"
                                      : "border-red-500 text-red-500 focus:border-red-600"
                                    }
                                  `}
                                  placeholder="_"
                                />
                              )
                            })}

                            {/* 提示按钮 */}
                            <button
                              onClick={() => setShowHint(!showHint)}
                              className="w-12 h-12 rounded-full flex items-center justify-center
                                bg-white border-2 border-stone-300 text-ink-black/60
                                hover:bg-stone-100 transition-colors"
                            >
                              {showHint ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                          
                          {/* 反馈信息 */}
                          {feedbackStatus === 'correct' && (
                            <div className="mt-3 text-center">
                              <div className="text-green-600 font-serif text-lg">
                                ✅ Correct! Great job!
                              </div>
                              <div className="text-sm text-stone-400 mt-1">
                                Press Enter or Space to continue
                              </div>
                            </div>
                          )}
                          {feedbackStatus === 'wrong' && (
                            <div className="mt-3 text-center">
                              <div className="text-red-600 font-serif text-lg mb-1">
                                Incorrect. Please try again.
                              </div>
                            </div>
                          )}
                          
                          {/* Sentence Details - 只在回答正确或点击提示时显示 */}
                          {(feedbackStatus === 'correct' || showHint) && (
                            <div className="mt-8 p-6 bg-stone-50 rounded-xl border border-stone-200">
                              <h4 className="text-sm font-bold text-stone-500 uppercase tracking-wide mb-4">
                                Sentence Details
                              </h4>
                              <div className="space-y-3">
                                {/* Chinese */}
                                <div>
                                  <p className="text-sm text-stone-500 mb-1">Chinese:</p>
                                  <p className="text-ink-black font-serif text-lg">
                                    {(currentItem as SentenceItem).zh}
                                  </p>
                                </div>
                                {/* Pinyin */}
                                <div>
                                  <p className="text-sm text-stone-500 mb-1">Pinyin:</p>
                                  <p className="text-ink-gray font-serif">{sentencePinyinFull}</p>
                                </div>
                                {/* English */}
                                <div>
                                  <p className="text-sm text-stone-500 mb-1">English:</p>
                                  <p className="text-ink-gray font-serif">
                                    {(currentItem as SentenceItem).en}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* 学英文模式的输入框 - 拼写和默写模式都显示 */}
                      {(mode === "A" || mode === "B") && !isLearnChinese && currentSentence && sentenceInputs.length > 0 && (
                        <div className="mt-8">
                          <div className="flex items-center justify-center gap-6 mb-6 flex-wrap">
                            <div className="flex items-center gap-3 flex-wrap justify-center max-w-full">
                              {sentenceInputs.map((value, index) => {
                                const sentence = currentItem as SentenceItem
                                const tokens = sentence?.en?.split(/\s+/).filter(Boolean) || []
                                const correctWord = tokens?.[index] || ''
                                const hasError = inputErrors[index] && value.length > 0
                                const isCorrect = feedbackStatus === 'correct'

                                // 【优化】根据单词长度精确计算宽度，每个字符约 14px，加上 padding
                                const charWidth = 14
                                const padding = 16
                                const minWidth = Math.max(50, correctWord.length * charWidth + padding)

                                return (
                                  <div key={index} className="relative flex flex-col items-center">
                                    <input
                                      ref={el => { sentenceInputRefs.current[index] = el }}
                                      type="text"
                                      value={value || ''}
                                      onChange={(e) => handleSentenceInputChange(index, e.target.value)}
                                      onKeyDown={(e) => {
                                        // ✅ 核心修复：阻止冒泡，防止全局监听器再次触发
                                        if (e.key === 'Enter') {
                                          e.stopPropagation()
                                          e.preventDefault()

                                          if (feedbackStatus === 'correct') {
                                            handleNext()
                                          } else if (index === sentenceInputs.length - 1) {
                                            handleCheck()
                                          }
                                          return
                                        }

                                        // 原有的空格键跳转逻辑保持不变
                                        if (e.key === ' ' && index < sentenceInputs.length - 1) {
                                          e.preventDefault()
                                          sentenceInputRefs.current[index + 1]?.focus()
                                        }

                                        // 原有的 Backspace 逻辑保持不变
                                        if (e.key === 'Backspace' && !value && index > 0) {
                                          sentenceInputRefs.current[index - 1]?.focus()
                                        }
                                      }}
                                      readOnly={isCorrect}
                                      style={{ width: `${minWidth}px` }}
                                      className={`
                                        h-12 text-lg font-serif px-2
                                        border-0 border-b-2 rounded-none bg-transparent
                                        text-center focus:outline-none
                                        transition-all duration-200
                                        ${isCorrect
                                          ? "border-green-500 text-green-600"
                                          : hasError && isShaking
                                            ? "border-red-500 text-red-600 animate-shake"
                                            : hasError
                                              ? "border-red-500 text-red-600"
                                              : "border-stone-400 text-ink-black focus:border-[#C23E32]"
                                        }
                                      `}
                                    />
                                  </div>
                                )
                              })}
                            </div>
                            
                            <button
                              onClick={() => setShowHint(!showHint)}
                              className="w-12 h-12 rounded-full flex items-center justify-center
                                bg-white border-2 border-stone-300 text-ink-black/60
                                hover:bg-stone-100 transition-colors"
                            >
                              {showHint ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                          
                          {feedbackStatus === 'correct' && (
                            <div className="mt-3 text-center text-green-600 font-serif text-lg">
                              ✅ Correct! Great job!
                            </div>
                          )}
                          
                          {/* 【新增】错误汇总提示 */}
                          {feedbackStatus === 'wrong' && (
                            <div className="mt-3 text-center text-red-500 font-serif text-sm">
                              ❌ 有 {inputErrors.filter(Boolean).length} 个单词需要修改
                            </div>
                          )}
                          {feedbackStatus === 'wrong' && (
                            <div className="mt-3 text-center">
                              <div className="text-red-600 font-serif text-lg mb-1">
                                Incorrect. Please try again.
                              </div>
                            </div>
                          )}
                          
                          {/* Sentence Details - 只在回答正确或点击提示时显示 */}
                          {(feedbackStatus === 'correct' || showHint) && (
                            <div className="mt-8 p-6 bg-stone-50 rounded-xl border border-stone-200">
                              <h4 className="text-sm font-bold text-stone-500 uppercase tracking-wide mb-4">
                                {isLearnChinese ? "Sentence Details" : "句子详情"}
                              </h4>
                              <div className="space-y-3">
                                {/* English */}
                                <div>
                                  <p className="text-sm text-stone-500 mb-1">{isLearnChinese ? "English:" : "英文:"}</p>
                                  <p className="text-ink-black font-serif text-lg">
                                    {(currentItem as SentenceItem).en}
                                  </p>
                                </div>
                                {/* Chinese */}
                                <div>
                                  <p className="text-sm text-stone-500 mb-1">{isLearnChinese ? "Chinese:" : "中文:"}</p>
                                  <p className="text-ink-gray font-serif">
                                    {(currentItem as SentenceItem).zh}
                                  </p>
                                </div>
                                {/* Pinyin */}
                                <div>
                                  <p className="text-sm text-stone-500 mb-1">{isLearnChinese ? "Pinyin:" : "拼音:"}</p>
                                  <p className="text-ink-gray font-serif">{sentencePinyinFull}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                ) : (
                  <div className="text-center py-12">
                    <p className="text-ink-gray font-serif text-lg">
                      {isLearnChinese ? "No content available" : "暂无学习内容"}
                    </p>
                  </div>
                )}
              </div>

              {/* 进度和控制按钮 */}
              {currentItem && (
                <div className="flex items-center justify-between">
                  <button
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                    className="w-12 h-12 rounded-full flex items-center justify-center
                      bg-white border-2 border-stone-300 text-ink-black/60
                      hover:bg-stone-100 transition-colors disabled:opacity-50"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>

                  <div className="flex-1 mx-8">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-stone-500">{isLearnChinese ? 'Progress' : '进度'}</span>
                      <span className="text-sm text-stone-500">{currentIndex + 1} / {totalItems}</span>
                    </div>
                    <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#C23E32] transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handlePlay}
                      className={`w-14 h-14 rounded-full flex items-center justify-center
                        bg-[#C23E32] text-white shadow-lg
                        hover:bg-[#A93226] transition-colors
                        ${isPlaying ? 'animate-pulse' : ''}`}
                    >
                      <Volume2 className="w-6 h-6" />
                    </button>

                    {mode === "B" && (
                      <>
                        <button
                          onClick={() => setFeedbackStatus('idle')}
                          className="w-14 h-14 rounded-full flex items-center justify-center
                            bg-white border-2 border-stone-300 text-ink-black/60
                            hover:bg-stone-100 transition-colors"
                        >
                          <X className="w-6 h-6" />
                        </button>
                        <button
                          onClick={handleCheck}
                          className="w-14 h-14 rounded-full flex items-center justify-center
                            bg-green-500 text-white shadow-lg
                            hover:bg-green-600 transition-colors"
                        >
                          <Check className="w-6 h-6" />
                        </button>
                      </>
                    )}

                    <button
                      onClick={handleNext}
                      disabled={currentIndex === totalItems - 1}
                      className="w-12 h-12 rounded-full flex items-center justify-center
                        bg-white border-2 border-stone-300 text-ink-black/60
                        hover:bg-stone-100 transition-colors disabled:opacity-50"
                    >
                      <RotateCcw className="w-5 h-5 rotate-180" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <BottomNavBar />

      {/* 升级会员弹窗 */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        type="study"
        nativeLang={isLearnChinese ? "en" : "zh"}
      />
    </>
  )
}

// 默认导出组件（带 Suspense 边界）
export default function StudyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#C23E32] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-ink-gray">加载中...</p>
        </div>
      </div>
    }>
      <StudyPageContent />
    </Suspense>
  )
}
