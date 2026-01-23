"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { getLanguageSettings, type NativeLang, type TargetLang } from "@/lib/language-utils"
import { type LearningMode, TRANSLATIONS } from "@/lib/i18n"

/**
 * 语言上下文接口
 */
interface LanguageContextType {
  learningMode: LearningMode
  nativeLang: NativeLang
  targetLang: TargetLang
  uiLanguage: NativeLang
  switchMode: (mode: LearningMode) => void
  t: any
}

/**
 * 语言上下文
 */
const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

/**
 * 语言Provider组件属性
 */
interface LanguageProviderProps {
  children: ReactNode
}

/**
 * 语言Provider组件
 * 提供全局语言状态管理和切换功能
 */
export function LanguageProvider({ children }: LanguageProviderProps) {
  const [learningMode, setLearningMode] = useState<LearningMode>("LEARN_ENGLISH")
  const [nativeLang, setNativeLang] = useState<NativeLang>("en")
  const [targetLang, setTargetLang] = useState<TargetLang>("zh")
  const [uiLanguage, setUiLanguage] = useState<NativeLang>("en")

  /**
   * 初始化语言设置
   */
  useEffect(() => {
    const settings = getLanguageSettings()
    const savedLearningMode = localStorage.getItem("inkwords_learning_mode") as LearningMode | null
    const mode = savedLearningMode || "LEARN_ENGLISH"
    setLearningMode(mode)
    setNativeLang(settings.nativeLang || "en")
    setTargetLang(settings.targetLang || "zh")
    
    /**
     * UI 语言逻辑（统一）：
     * - 当模式为 LEARN_CHINESE (目标是中文) -> 意味着用户母语是英语 -> UI 必须显示英文
     * - 当模式为 LEARN_ENGLISH (目标是英语) -> 意味着用户母语是中文 -> UI 必须显示中文
     */
    const uiLang = mode === 'LEARN_CHINESE' ? 'en' : 'zh'
    setUiLanguage(uiLang)
  }, [])

  /**
   * 监听语言设置变化
   */
  useEffect(() => {
    const handleStorageChange = () => {
      const settings = getLanguageSettings()
      const savedLearningMode = localStorage.getItem("inkwords_learning_mode") as LearningMode | null
      if (savedLearningMode) {
        setLearningMode(savedLearningMode)
        
        /**
         * UI 语言逻辑（统一）：
         * - 当模式为 LEARN_CHINESE (目标是中文) -> 意味着用户母语是英语 -> UI 必须显示英文
         * - 当模式为 LEARN_ENGLISH (目标是英语) -> 意味着用户母语是中文 -> UI 必须显示中文
         */
        const uiLang = savedLearningMode === 'LEARN_CHINESE' ? 'en' : 'zh'
        setUiLanguage(uiLang)
      }
      if (settings.nativeLang) {
        setNativeLang(settings.nativeLang)
      }
      if (settings.targetLang) {
        setTargetLang(settings.targetLang)
      }
    }

    window.addEventListener("storage", handleStorageChange)
    
    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  /**
   * 切换学习模式
   */
  const switchMode = (mode: LearningMode) => {
    setLearningMode(mode)
    
    let newNativeLang: NativeLang
    let newTargetLang: TargetLang
    
    if (mode === "LEARN_CHINESE") {
      newNativeLang = "en"
      newTargetLang = "zh"
    } else if (mode === "LEARN_ENGLISH") {
      newNativeLang = "zh"
      newTargetLang = "en"
    } else {
      return
    }
    
    setNativeLang(newNativeLang)
    setTargetLang(newTargetLang)
    
    const uiLang = mode === 'LEARN_CHINESE' ? 'en' : 'zh'
    setUiLanguage(uiLang)
    
    localStorage.setItem("inkwords_learning_mode", mode)
    localStorage.setItem("inkwords_native_lang", newNativeLang)
    localStorage.setItem("inkwords_target_lang", newTargetLang)
  }

  const t = TRANSLATIONS[learningMode]

  const value: LanguageContextType = {
    learningMode,
    nativeLang,
    targetLang,
    uiLanguage,
    switchMode,
    t
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

/**
 * 使用语言上下文的Hook
 */
export function useLanguage() {
  const context = useContext(LanguageContext)
  
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  
  return context
}
