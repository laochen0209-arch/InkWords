"use client"

import { useState, useEffect } from "react"
import { ChevronRight, User, Globe, Moon, Bell, HelpCircle, Info } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/lib/contexts/language-context"
import { TRANSLATIONS } from "@/lib/i18n"
import { getLanguageSettings } from "@/lib/language-utils"

interface SettingItem {
  id: string
  icon: typeof User
  label: string
  value?: string
  hasToggle?: boolean
  defaultToggle?: boolean
  href?: string
}

interface SettingsListProps {
  nativeLang?: string
}

export function SettingsList({ nativeLang }: SettingsListProps) {
  const [toggleStates, setToggleStates] = useState<Record<string, boolean>>({
    notification: true,
  })
  const [languageValue, setLanguageValue] = useState("")
  const { learningMode } = useLanguage()

  const t = TRANSLATIONS[learningMode]

  const settingItems = [
    { 
      id: "account", 
      icon: User, 
      label: t.settings.account, 
      href: "/settings/account",
    },
    { 
      id: "languages", 
      icon: Globe, 
      label: t.settings.languages, 
      value: "", 
      href: "/settings/languages",
    },
    { 
      id: "appearance", 
      icon: Moon, 
      label: t.settings.appearance, 
      href: "/settings/appearance",
    },
    { 
      id: "notification", 
      icon: Bell, 
      label: t.nav.notifications, 
      hasToggle: true, 
      defaultToggle: true 
    },
    { 
      id: "help", 
      icon: HelpCircle, 
      label: t.settings.help, 
      href: "/settings/help",
    },
    { 
      id: "about", 
      icon: Info, 
      label: t.settings.about, 
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

  const handleToggle = (id: string) => {
    setToggleStates(prev => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  return (
    <div className="bg-[#FDFBF7]/90 shadow-[0_4px_20px_rgba(43,43,43,0.08)] overflow-hidden">
      {settingItems.map((item, index) => {
        const Icon = item.icon
        const isLast = index === settingItems.length - 1
        const isToggleOn = toggleStates[item.id] ?? item.defaultToggle
        
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
              !isLast && "border-b border-ink-gray/10"
            )}
            onClick={() => {
              if (item.hasToggle) {
                handleToggle(item.id)
              }
            }}
          >
            {content}
          </button>
        )
      })}
    </div>
  )
}
