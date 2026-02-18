"use client"

import { useState, useEffect } from "react"
import { ChevronRight, User, Globe, Moon, Bell, HelpCircle, Info } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/lib/contexts/language-context"
import { TRANSLATIONS } from "@/lib/i18n"
import { getLanguageSettings } from "@/lib/language-utils"
import { useNotifications } from "@/lib/hooks/use-notifications"

interface SettingItem {
  id: string
  icon: typeof User
  label: string
  value?: string
  hasToggle?: boolean
  href?: string
}

interface SettingsListProps {
  nativeLang?: string
}

export function SettingsList({ nativeLang }: SettingsListProps) {
  const [languageValue, setLanguageValue] = useState("")
  const { learningMode } = useLanguage()
  const { 
    state: notificationState, 
    subscribe, 
    unsubscribe,
    sendTestNotification 
  } = useNotifications()

  const t = TRANSLATIONS[learningMode]

  // 【修复】提供安全的翻译获取函数
  const getTranslation = (key: string, defaultValue: string) => {
    try {
      const keys = key.split('.');
      let value: any = t;
      for (const k of keys) {
        value = value?.[k];
      }
      return value || defaultValue;
    } catch {
      return defaultValue;
    }
  };

  // 判断是否为中文界面
  const isChineseUI = learningMode === "LEARN_ENGLISH"

  // 通知开关状态
  const [notificationEnabled, setNotificationEnabled] = useState(false)

  // 从 localStorage 读取通知设置
  useEffect(() => {
    const saved = localStorage.getItem('notifications-enabled')
    if (saved) {
      setNotificationEnabled(saved === 'true')
    } else {
      // 默认根据订阅状态
      setNotificationEnabled(notificationState.isSubscribed)
    }
  }, [notificationState.isSubscribed])

  const settingItems: SettingItem[] = [
    { 
      id: "account", 
      icon: User, 
      label: getTranslation('settings.account', isChineseUI ? '账号设置' : 'Account Settings'), 
      href: "/settings/account",
    },
    { 
      id: "languages", 
      icon: Globe, 
      label: getTranslation('settings.languages', isChineseUI ? '语言设置' : 'Language Settings'), 
      value: "", 
      href: "/settings/languages",
    },
    { 
      id: "appearance", 
      icon: Moon, 
      label: getTranslation('settings.appearance', isChineseUI ? '外观设置' : 'Appearance'), 
      href: "/settings/appearance",
    },
    { 
      id: "notification", 
      icon: Bell, 
      label: getTranslation('nav.notifications', isChineseUI ? '通知' : 'Notifications'), 
      hasToggle: true,
    },
    { 
      id: "help", 
      icon: HelpCircle, 
      label: getTranslation('settings.help', isChineseUI ? '帮助与反馈' : 'Help & Feedback'), 
      href: "/settings/help",
    },
    { 
      id: "about", 
      icon: Info, 
      label: getTranslation('settings.about', isChineseUI ? '关于墨语' : 'About InkWords'), 
      href: "/settings/about",
    },
  ]

  /**
   * 获取语言设置显示值
   */
  useEffect(() => {
    const settings = getLanguageSettings()
    const nativeName = settings.nativeLang === "zh" ? "中文" : "English"
    const targetName = settings.targetLang === "zh" ? "中文" : "English"
    setLanguageValue(`${nativeName} → ${targetName}`)
  }, [learningMode])

  /**
   * 监听语言设置变化
   */
  useEffect(() => {
    const handleStorageChange = () => {
      const settings = getLanguageSettings()
      const nativeName = settings.nativeLang === "zh" ? "中文" : "English"
      const targetName = settings.targetLang === "zh" ? "中文" : "English"
      setLanguageValue(`${nativeName} → ${targetName}`)
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  // 处理通知开关
  const handleNotificationToggle = async () => {
    if (notificationState.isLoading) return

    const newValue = !notificationEnabled
    
    if (newValue) {
      // 开启通知
      const success = await subscribe()
      if (success) {
        setNotificationEnabled(true)
        localStorage.setItem('notifications-enabled', 'true')
        // 发送测试通知
        setTimeout(() => {
          sendTestNotification()
        }, 1000)
      }
    } else {
      // 关闭通知
      const success = await unsubscribe()
      if (success) {
        setNotificationEnabled(false)
        localStorage.setItem('notifications-enabled', 'false')
      }
    }
  }

  // 获取通知开关状态显示
  const getNotificationStatus = () => {
    if (notificationState.isLoading) return "加载中..."
    if (!notificationState.isSupported) return "不支持"
    if (notificationState.permission === 'denied') return "已阻止"
    if (notificationEnabled) return "已开启"
    return "已关闭"
  }

  return (
    <div className="bg-white/90 dark:bg-[#2a2a2a]/90 shadow-[0_4px_20px_rgba(43,43,43,0.08)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] overflow-hidden">
      {settingItems.map((item, index) => {
        const Icon = item.icon
        const isLast = index === settingItems.length - 1
        
        // 通知项特殊处理
        const isNotification = item.id === 'notification'
        const isToggleOn = isNotification 
          ? notificationEnabled && notificationState.permission === 'granted'
          : false
        
        const content = (
          <>
            {/* 左侧 */}
            <div className="flex items-center gap-3">
              <Icon className="w-5 h-5 text-ink-gray" strokeWidth={1.5} />
              <span className="text-ink-black font-serif text-sm truncate">
                {item.label}
              </span>
            </div>
            
            {/* 右侧 */}
            <div className="flex items-center gap-2">
              {item.value && (
                <span className="text-ink-gray text-xs font-sans">
                  {item.id === "languages" ? languageValue : item.value}
                </span>
              )}
              
              {isNotification && (
                <span className={cn(
                  "text-xs font-sans mr-2",
                  notificationState.permission === 'denied' ? "text-red-500" : "text-ink-gray"
                )}>
                  {getNotificationStatus()}
                </span>
              )}
              
              {item.hasToggle ? (
                <div 
                  className={cn(
                    "w-10 h-6 rounded-full transition-colors duration-200 relative",
                    isToggleOn ? "bg-ink-vermilion" : "bg-ink-gray/30"
                  )}
                >
                  <div 
                    className={cn(
                      "absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200",
                      isToggleOn ? "translate-x-5" : "translate-x-1"
                    )}
                  />
                </div>
              ) : item.href ? (
                <ChevronRight className="w-4 h-4 text-ink-gray/60" strokeWidth={1.5} />
              ) : null}
            </div>
          </>
        )

        if (item.href) {
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "w-full flex items-center justify-between px-4 py-4 cursor-pointer",
                "transition-colors duration-200 hover:bg-black/5",
                !isLast && "border-b border-ink-gray/10"
              )}
            >
              {content}
            </Link>
          )
        }

        return (
          <button
            key={item.id}
            type="button"
            className={cn(
              "w-full flex items-center justify-between px-4 py-4 cursor-pointer",
              "transition-colors duration-200 hover:bg-black/5",
              !isLast && "border-b border-ink-gray/10",
              notificationState.isLoading && "opacity-50 cursor-not-allowed"
            )}
            onClick={() => {
              if (item.hasToggle && item.id === 'notification') {
                handleNotificationToggle()
              }
            }}
            disabled={notificationState.isLoading}
          >
            {content}
          </button>
        )
      })}
      
      {/* 错误提示 */}
      {notificationState.error && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-100">
          <p className="text-xs text-red-600 font-sans">
            {notificationState.error}
          </p>
        </div>
      )}
      
      {/* 权限被拒绝提示 */}
      {notificationState.permission === 'denied' && (
        <div className="px-4 py-2 bg-yellow-50 border-t border-yellow-100">
          <p className="text-xs text-yellow-700 font-sans">
            请在浏览器设置中允许通知权限，然后刷新页面重试
          </p>
        </div>
      )}
    </div>
  )
}
