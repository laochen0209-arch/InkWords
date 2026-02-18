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
  switchUiLanguage: (lang: NativeLang) => void
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
 * 
 * 【重要】学习语言和 UI 语言已彻底分离：
 * - learningMode/targetLang: 用户想要学习的语言
 * - uiLanguage: 网站界面显示的语言，完全独立
 */
export function LanguageProvider({ children }: LanguageProviderProps) {
  const [learningMode, setLearningMode] = useState<LearningMode>("LEARN_ENGLISH")
  const [nativeLang, setNativeLang] = useState<NativeLang>("en")
  const [targetLang, setTargetLang] = useState<TargetLang>(zh")
  const [uiLanguage, setUiLanguage] = useState<NativeLang>("en")

  /**
   * 初始化语言设置
   * 【修复】学习语言和 UI 语言分别从不同的 localStorage key 读取
   */
  useEffect(() => {
    const settings = getLanguageSettings()
    
    // 读取学习模式（独立存储）
    const savedLearningMode = localStorage.getItem("inkwords_learning_mode") as LearningMode | null
    const mode = savedLearningMode || "LEARN_ENGLISH"
    setLearningMode(mode)
    setNativeLang(settings.nativeLang || "en")
    setTargetLang(settings.targetLang || "zh")
    
    // 【修复】UI 语言独立读取，不再与学习模式绑定
    const savedUiLanguage = localStorage.getItem("inkwords_ui_language") as NativeLang | null
    const uiLang = savedUiLanguage || "en"
    setUiLanguage(uiLang)
  }, [])

  /**
   * 监听语言设置变化
   */
  useEffect(() => {
    const handleStorageChange = () => {
      const settings = getLanguageSettings()
      
      // 读取学习模式
      const savedLearningMode = localStorage.getItem("inkwords_learning_mode") as LearningMode | null
      if (savedLearningMode) {
        setLearningMode(savedLearningMode)
      }
      
      // 【修复】UI 语言独立读取，不再随学习模式变化
      const savedUiLanguage = localStorage.getItem("inkwords_ui_language") as NativeLang | null
      if (savedUiLanguage) {
        setUiLanguage(savedUiLanguage)
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
   * 【修复】不再修改 UI 语言，学习语言和 UI 语言彻底分离
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
    
    // 【修复】不再修改 UI 语言，保持独立
    
    localStorage.setItem("inkwords_learning_mode", mode)
    localStorage.setItem("inkwords_native_lang", newNativeLang)
    localStorage.setItem("inkwords_target_lang", newTargetLang)
  }

  /**
   * 【新增】独立切换 UI 语言
   * 用户可以单独设置网站界面语言，不影响学习语言
   */
  const switchUiLanguage = (lang: NativeLang) => {
    setUiLanguage(lang)
    localStorage.setItem("inkwords_ui_language", lang)
  }

  const t = TRANSLATIONS[learningMode]

  const value: LanguageContextType = {
    learningMode,
    nativeLang,
    targetLang,
    uiLanguage,
    switchMode,
    switchUiLanguage,
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
