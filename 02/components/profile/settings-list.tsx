"use client"

import { useState } from "react"
import { ChevronRight, Globe, Bell, HelpCircle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface SettingItem {
  id: string
  icon: typeof Globe
  label: string
  value?: string
  hasToggle?: boolean
  defaultToggle?: boolean
}

const settingItems: SettingItem[] = [
  { 
    id: "language", 
    icon: Globe, 
    label: "学习偏好", 
    value: "中文 → English" 
  },
  { 
    id: "notification", 
    icon: Bell, 
    label: "消息通知", 
    hasToggle: true, 
    defaultToggle: true 
  },
  { 
    id: "help", 
    icon: HelpCircle, 
    label: "帮助与反馈" 
  },
  { 
    id: "about", 
    icon: Info, 
    label: "关于墨语" 
  },
]

export function SettingsList() {
  const [toggleStates, setToggleStates] = useState<Record<string, boolean>>({
    notification: true,
  })

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
        
        return (
          <button
            key={item.id}
            type="button"
            className={cn(
              "w-full flex items-center justify-between px-4 py-4",
              "transition-colors duration-200 hover:bg-ink-black/[0.02]",
              !isLast && "border-b border-ink-gray/10"
            )}
            onClick={() => {
              if (item.hasToggle) {
                handleToggle(item.id)
              }
            }}
          >
            {/* 左侧 */}
            <div className="flex items-center gap-3">
              <Icon className="w-5 h-5 text-ink-gray" strokeWidth={1.5} />
              <span className="text-ink-black font-serif text-sm">
                {item.label}
              </span>
            </div>
            
            {/* 右侧 */}
            <div className="flex items-center gap-2">
              {item.value && (
                <span className="text-ink-gray text-xs font-sans">
                  {item.value}
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
              ) : (
                <ChevronRight className="w-4 h-4 text-ink-gray/60" strokeWidth={1.5} />
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}
