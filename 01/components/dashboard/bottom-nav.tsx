"use client"

import { BookText, Library, User } from "lucide-react"
import { cn } from "@/lib/utils"

type TabId = "study" | "library" | "profile"

interface BottomNavProps {
  activeTab?: TabId
  onTabChange?: (tab: TabId) => void
}

const tabs = [
  { id: "study" as TabId, label: "修习", icon: BookText },
  { id: "library" as TabId, label: "文库", icon: Library },
  { id: "profile" as TabId, label: "我的", icon: User },
]

export function BottomNav({ activeTab = "study", onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 bg-[#FDFBF7]/80 backdrop-blur-md border-t border-border/50">
      <div className="flex items-center justify-around px-6 py-2 pb-[env(safe-area-inset-bottom,8px)]">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          const Icon = tab.icon
          
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange?.(tab.id)}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors",
                isActive 
                  ? "text-ink-vermilion" 
                  : "text-ink-gray hover:text-ink-black"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon 
                className={cn(
                  "w-5 h-5 transition-transform",
                  isActive && "scale-110"
                )} 
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className={cn(
                "text-xs font-medium",
                isActive && "font-semibold"
              )}>
                {tab.label}
              </span>
              
              {/* 选中态指示点 */}
              {isActive && (
                <span 
                  className="absolute -bottom-0.5 w-1 h-1 bg-ink-vermilion rounded-full"
                  aria-hidden="true"
                />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
